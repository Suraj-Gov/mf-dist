import express from "express"
import axios from "axios"

const app = express()

app.get("/:pincode", async (req, res) => {
	const pin = req.params.pincode;
	if(pin.length !== 6 || isNaN(pin)) {
		res.send('invalid pin')
		return;
	}
	const {data} = await axios({
		method: "POST",
		baseURL: `https://www.amfiindia.com/modules/NearestFinancialAdvisorsDetails?nfaType=All&nfaARN=&nfaARNName=&nfaAddress=&nfaCity=&nfaPin=${pin}`,
	})	
	res.send(data)
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
	console.log(`listening on port ${PORT}`)
})