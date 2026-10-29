const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {Resend} = require('resend');
require('dotenv').config();
const cron = require('node-cron');

const resend = new Resend(process.env.RESEND_API_KEY);
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

cron.schedule("* * * * * ", async () => {
  try{
    await User.deleteMany({ isVerified: false, verificationCodeExpires: { $lt: new Date() } });
  }
  catch(error){
    console.error("CRON ERROR:", error);
  } 
})




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
        if(!user.isVerified) {
            return res.status(401).json({ success: false, message: 'Имэйл хаяг баталгаажуулаагүй байна.' });
        }
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
        res.json({ success: true, user, token });
    } 
    if(!user) { 
        res.status(401).json({ success: false, message: 'Invalid email or password' },);
    }  
})

app.post('/register', async (req, res) => {
    try{

    const { email, password } = req.body;

    const cleanEmail = email.trim().toLowerCase();
    
    const emailRegex = /^[a-zA-Z0-9._%+-]+@amardaatgal\.mn$/;

    const isEmailValid = emailRegex.test(cleanEmail);

    if(!isEmailValid ) {
        return res.status(400).json({ success: false, message: 'Имэйл хаяг зөвхөн ...@amardaatgal.mn байх ёстой' });
    }
    
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
        return res.status(400).json({ success: false, message: 'Имэйл хаяг аль хэдийн бүртгэгдсэн байна' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const result =await resend.emails.send({
        from: "onboarding@resend.dev",
        to: cleanEmail,
        subject: "Амар Даатгалд тавтай морилно уу!",
        html: `<h2>Амар Даатгалд тавтай морилно уу!</h2>
            <p>Таны баталгаажуулалтын код:</p>
            <h1>${code}</h1>`,
    })


    await User.create({ email: cleanEmail, password: hashedPassword, verificationCode: code, isVerified: false, verificationCodeExpires: new Date(Date.now() + 5 * 60 * 1000)});
    res.json({ success: true, message: 'Бүртгэл амжилттай боллоо. Баталгаажуулалтын код таны имэйл хаяг руу илгээгдсэн.' });

    }
    catch(err) {
        console.error('Error during registration', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.delete('/riskAssessments/:id', async (req, res) => {
    const id = req.params.id;
    await RiskAssessment.findByIdAndDelete(id);
    res.json({ success: true });
})



app.put('/insurance-products/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
    await InsuranceProduct.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true });
})

app.put("/verify-email", async (req, res) => {
    try{
        const { email, code } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ success: false, message: 'Имэйл хаяг олдсонгүй' });
        }

        if (user.verificationCode != code) {
            return res.status(400).json({ success: false, message: 'Баталгаажуулах код буруу байна' });
        }
        
        user.isVerified = true;
        user.verificationCode = null; 
        user.verificationCodeExpires = null;
        await user.save();
        res.json({ success: true, message: 'Имэйл амжилттай баталгаажлаа' });
    }
    catch(err) {
        console.error('Error during email verification', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.get('/users', verifyToken, async (req, res) => {
    const users = await User.find();
    res.json(users);
})

app.get('/products/:id', async (req, res) => {
    const product = await InsuranceProduct.findById(req.params.id);
    res.json(product);
})

app.delete('/products/:id', async (req, res) => {
    const id = req.params.id;
    await InsuranceProduct.findByIdAndDelete(id);
    res.json({ success: true });
})

app.put('/users/:id', async (req, res) => {
    const id = req.params.id;
    const updateData = req.body;
    await User.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ success: true });
})

app.delete('/users/:id', async (req, res) => {
    const id = req.params.id;
    await User.findByIdAndDelete(id);
    res.json({ success: true });
})

app.put('/reset-password', async (req, res) => {
    try{
        const { email, newPassword } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Имэйл хаяг олдсонгүй' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();
        res.json({ success: true, message: 'Нууц үг амжилттай солигдлоо' });
    }
    catch(err) {
        console.error('Error during password reset', err);
        res.status(500).json({ success: false, message: 'Internal server error' }); 
    }
})

app.post('/forgot-password', async (req, res) => {
    try{
        const { email } = req.body;
        const user = await User.findOne({email})

        if(!user){
            return res.status(400).json({ success: false, message: 'Имэйл хаяг олдсонгүй' });
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetPasswordCode = code;
        user.resetPasswordVerified = false;
        user.resetPasswordCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        await resend.emails.send({
            from: "noreply@amardaatgal.risk.mn",
            to: email,
            subject: "Нууц үг сэргээх код",
            html: `<p>Таны нууц үг сэргээх код: </p>
            <h1>${code}</h1>`,
        });

        res.json({ success: true, message: 'Нууц үг сэргээх код илгээгдлээ' });
    }
    catch(err) {
        console.error('Error during forgot password', err);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.put('/verify-reset-password-code', async (req, res) => {
    try{
        const { email, code } = req.body;
        const user = await User.findOne({ email });

    if(!user){
        return res.status(400).json({ success: false, message: 'Имэйл хаяг олдсонгүй' });
    }

    if(user.resetPasswordCode !== code){
        return res.status(400).json({ success: false, message: 'Нууц үг сэргээх код буруу байна' });
    }

    user.resetPasswordVerified = true;
    user.resetPasswordCode = null;
    user.resetPasswordCodeExpires = null;
    await user.save();
    res.json({ success: true, message: 'Нууц үг сэргээх код баталгаажлаа' });
    }
    catch(err){
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.put('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(400).json({ success: false, message: 'Имэйл хаяг олдсонгүй' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.json({ success: true, message: 'Нууц үг амжилттай солигдлоо' });
})

module.exports = app;