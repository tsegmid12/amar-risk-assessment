const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();


const InsuranceProduct = require('./models/insuranceProduct');
const Recomandation = require('./models/recomendation');
const RiskAssessment = require('./models/riskAssessment');
const User = require('./models/user');
const PORT = process.env.PORT 
const MONGO_URI = process.env.MONGO_URI 


mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
    try{
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }

        if(!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid authorization header format' });
        }   

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error('Error verifying token', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


app.post('/insurance-products', async (req, res) => {
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


app.get('/insurance-products', async (req, res) => {
    const insuranceProducts = await InsuranceProduct.find();
    res.json( insuranceProducts );
})

app.get('/risk-assessments', verifyToken, async (req, res) => {
    const id = req.user.id

    const riskAssessments = await RiskAssessment.find({user: id}).populate('selectedInsurance')
    res.json(riskAssessments);
})

app.get('/riskAssessments/:id', async (req, res) => {
    const riskAssessment = await RiskAssessment.findById(req.params.id).populate('selectedInsurance');
    res.json(riskAssessment);
})


app.put('/riskAssessments/:id', async (req, res) => {
    const riskAssessment = await RiskAssessment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(riskAssessment);
})


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    const isMatch = await bcrypt.compare(password, user.password) 
    if (user) {
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ success: true, user, token });
    } 
    if(!user) { 
        res.status(401).json({ success: false, message: 'Invalid email or password' });
    }  
})

app.post('/register', async (req, res) => {
    try{

    const { email, password } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@amardaatgal\.mn$/;

    const isEmailValid = emailRegex.test(cleanEmail);

    if(!isEmailValid) {
        return res.status(400).json({ success: false, message: 'Имэйл хаяг зөвхөн ...@amardaatgal.mn байх ёстой' });
    }
    
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Имэйл хаяг аль хэдийн бүртгэгдсэн байна' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ email: cleanEmail, password: hashedPassword });
    res.json({ success: true});
    }
    catch(err) {
        console.error('Error during registration', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.get('/users', verifyToken, async (req, res) => {
    const users = await User.find();
    res.json(users);
})
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
})