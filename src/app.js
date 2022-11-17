import express from  "express"
import bodyParser from "body-parser"
import fs from "fs"

/**
 * KNOWN ISSUE(S)
 * WriteFileSync doesnt actually have any error handling so should update to write file async
 * https://stackoverflow.com/questions/15543235/checking-if-writefilesync-successfully-wrote-the-file
 */

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}))


const filePath = "./database/products.json"


export const readDatabase = () => {
	try {
		const file = fs.readFileSync(filePath, 'utf8')
		return JSON.parse(file)
	}catch (err) {
		if (err.code === "ENOENT") {
			const file = '{"products":[]}'
			try{
				fs.writeFileSync(filePath, file)
			}
			catch(err){
				console.error(err)
				return err
			}
			return JSON.parse(file)
		}
		console.error(err)
		return err
	}
}

const writeDatabase = (data) => {
	try {
		fs.writeFileSync(filePath, JSON.stringify(data))

	} catch (err) {
		console.error(err)
		return err
	}
}

const findProduct = (id, products, index = false) => {
	if (index){
		const find = products.findIndex(product => product.stock_number === id)
		return find
	}
	const find = products.find(product => product.stock_number === id)
	return find
}


app.get('/products/:stock_number', (req, res) => {
	const database = readDatabase()
	if (database.code){
		res.status(database.code).send(database)
		return
	}
	const product = findProduct(req.params.stock_number, database.products)
	if (!product) {
		res.status(404).send("Product does not exist in database")
		return
	}
	res.status(200).send(product)

})

app.put('/products/:stock_number', (req, res) => {
	const reqProduct = req.body
	const database = readDatabase()
	if (database.code){
		res.status(database.code).send(database)
		return
	}
	const index = findProduct(req.params.stock_number, database.products, true)
	if (index === -1) {
		res.status(404).send("Product does not exist in database")
		return
	}
	database.products[index] = reqProduct
	const resp = writeDatabase(database)
	if (resp) {
		res.status(500).send("Unexpected error writing to database")
		return
	}
	res.status(200).send(`Successfully edited database entry for stock No. ${reqProduct.stock_number}`)
})


app.post('/products/', (req, res) => {
	const reqProduct = req.body
	const database = readDatabase()
	if (database.code){
		res.status(database.code).send(database)
		return
	}
	const find = findProduct(reqProduct.stock_number,database.products)
	if (find) {
		res.status(403).send("That product already exists")
		return
	}
	database.products.push(reqProduct)
	const resp = writeDatabase(database)
	if (resp) {
		res.status(500).send("Unexpected error writing to database")
		return
	}

	res.status(200).send(`Successfully written product Stock No. ${reqProduct.stock_number} to database`)
	
})


app.get("/", (req, res) =>{
	console.log("hello world")
	res.send("Hello")
})


export default app