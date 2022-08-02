const { response, request } = require('express')
const express = require('express')
const morgan = require('morgan')
const app = express()

app.use(express.json())

morgan.token('body', (request, response) => JSON.stringify(request.body))
app.use(morgan(':method: url :status :res[content-length] :response-time ms :body'))

const cors = require('cors')
app.use(cors())

app.use(express.static('build'))

let persons = [
    {
        "name": "Arto Hellas",
        "number": "040-123456",
        "id": 1
    },
    {
        "name": "Ada Lovelace",
        "number": "39-44-5323523",
        "id": 2
    },
    {
        "name": "Dan Abramov",
        "number": "12-43-234345",
        "id": 3
    },
    {
        "name": "Mary Poppendieck",
        "number": "39-23-6423122",
        "id": 4
    },
    {
        "name": "Dan Brown",
        "number": "050-7135456",
        "id": 5
    }
]

generateId = () => {
    return Math.floor(Math.random() * 1000)
}

app.get('/info', (require, response) => {
    response.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <div>${new Date()}</div>
    `)
})

app.get('/api/persons', (require, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (require, response) => {
    const id = Number(require.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/persons/:id', (require, response) => {
    const id = Number(require.params.id)
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
})

app.post('/api/persons', (require, response) => {
    const body = require.body
    console.log(body)
    
    if (!body.name) {
        return response.status(400).json({
          error: 'name missing'
        })
    }

    if (!body.number) {
        return response.status(400).json({
          error: 'number missing'
        })
    }

    if (persons.filter(person => person.name === body.name).length > 0) {
        return response.json({
          error: 'name must be unique'
        })
    }

    person = {
        name: body.name,
        number: body.number,
        id: generateId()
    }

    persons = persons.concat(person)
    response.json(persons)
})

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)