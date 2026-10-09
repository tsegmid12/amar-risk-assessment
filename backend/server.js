const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');

const Organization = require('./models/organization');
const InsuranceProduct = require('./models/insuranceProduct');
const Recomandation = require('./models/recomendation');
const RiskAssessment = require('./models/riskAssessment');
const PORT = 3000;

mongoose.connect('mongodb://localhost:27017/amar').then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

app.use(cors());
app.use(express.json());

app.post('/organizations', async (req, res) => {
    console.log(req.body); 
   const organization = await Organization.create(req.body);
   res.json(organization);
})

app.post('/insurance-products', async (req, res) => {
    console.log(req.body);
    const insuranceProduct = await InsuranceProduct.create(req.body);
    res.json(insuranceProduct);
})

app.post('/recomendations', async (req, res) => {
    const recomendation = await Recomandation.create(req.body);
    res.json(recomendation);
})


app.post('/risk-assessments', async (req, res) => {
    const riskAssessment = await RiskAssessment.create(req.body);
    res.json(riskAssessment);
})

app.get('/organization/:id', async (req, res) => {
    try{
        const { id } = req.params;
        const organizations = await Organization.findById(id);
        res.json(organizations);
    }
    catch(err){
        res.status(500).json({error: 'Error fetching organizations'});
    }
})

app.get('/insurance-products', async (req, res) => {
    const insuranceProducts = await InsuranceProduct.find();
    res.json(insuranceProducts);
})

app.get('/risk-assessments', async (req, res) => {
    const riskAssessments = await RiskAssessment.find();
    res.json(riskAssessments);
})


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})