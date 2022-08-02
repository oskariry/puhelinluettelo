const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}


const newName = process.argv[3] || ""
const newNumber = process.argv[4] || ""
const password = process.argv[2]

const url =
  `mongodb+srv://fullstack:${password}@cluster0.v4pfwmt.mongodb.net/PhonebookApp?retryWrites=true&w=majority`

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (newName.length > 0 && newNumber.length > 0) {
    const contactInfo = new Person({
        name: newName,
        number: newNumber
    })
    contactInfo.save().then(result => {
        console.log(`added ${contactInfo.name} number ${contactInfo.number} to phonebook`)
        mongoose.connection.close()
    })
}
/*
note.save().then(result => {
  console.log('note saved!')
  mongoose.connection.close()
})
*/

Person.find({}).then(result => {
    console.log("phonebook:")
    result.forEach(person => {
        console.log(person.name, person.number)
    })
    mongoose.connection.close()
})