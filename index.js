const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const morgan = require('morgan')
const Person = require('./models/person')


app.use(express.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('body', (request, response) => JSON.stringify(request.body))
app.use(morgan(':method: url :status :res[content-length] :response-time ms :body'))



/*
generateId = () => {
    return Math.floor(Math.random() * 1000)
}
*/

app.get('/info', (request, response) => {
    Person.find({}).then(returnedPersons => {
        response.send(`
        <div>Phonebook has info for ${returnedPersons.length} people</div>
        <div>${new Date()}</div>
        `)
    })
})

app.post('/api/persons', (request, response) => {
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
            }
        })
    }
    /*
    if (persons.filter(person => person.name === body.name).length > 0) {
        return response.json({
          error: 'name must be unique'
        })
    }

    const person = new Person({
        name: body.name,
        number: body.number
    })

    person.save().then(savedPerson => {
        response.json(savedPerson)
    })
    */
})

app.get('/api/persons', (request, response) => {
    Person.find({}).then(returnedPersons => {
        console.log(returnedPersons)
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
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})



const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)