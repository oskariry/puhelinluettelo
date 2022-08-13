const express = require('express')
const morgan = require('morgan')
const app = express()
morgan.token('body', (request) => JSON.stringify(request.body))
app.use(morgan(':method: url :status :res[content-length] - :response-time ms :body'))
app.use(morgan('tiny'))
const cors = require('cors')
require('dotenv').config()
const Person = require('./models/person')


app.use(express.json())
app.use(cors())
app.use(express.static('build'))

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (body.name === undefined && body.number === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }
  if (body.name === undefined) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (body.number === undefined) {
    return response.status(400).json({
      error: 'number missing'
    })
  }else {
    Person.find({}).then(returnedPersons => {
      if (returnedPersons.filter(person => person.name === body.name).length > 0) {
        return response.json({
          error: 'name must be unique'
        })
      }else {
        const person = new Person({
          name:body.name,
          number: body.number
        })
        person.save().then(savedPerson => {
          response.json(savedPerson)
        })
          .catch(error => next(error))
      }
    })
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => {
      console.log('put error')
      next(error)})
})

app.get('/info', (request, response) => {
  Person.find({}).then(returnedPersons => {
    response.send(`
      <div>Phonebook has info for ${returnedPersons.length} people</div>
      <div>${new Date()}</div>
    `)
  })
})


app.get('/api/persons', (request, response) => {
  Person.find({}).then(returnedPersons => {
    response.json(returnedPersons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      }else{
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then( () => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)



const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)