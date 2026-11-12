const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const {Resend} = require('resend');
require('dotenv').config();
const cron = require('node-cron'); 
const { createProposalDeal } = require('./bitrix');
const { createPriceOfferDeal } = require('./bitrix');
const {Readable} = require('stream');
const path = require('path');

const resend = new Resend(process.env.RESEND_API_KEY);
const InsuranceProduct = require('./models/insuranceProduct');
const Recomandation = require('./models/recomendation');
const RiskAssessment = require('./models/riskAssessment');
const PriceOffer = require('./models/priceOffer');
const User = require('./models/user');
const PORT = process.env.PORT 
const MONGO_URI = process.env.MONGO_URI 
const upload = require('./middleware/imageUpload');
const RiskImage = require('./models/RiskImage');
const AdditionalService = require('./models/additionalService');

mongoose.connect(MONGO_URI).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Error connecting to MongoDB', err);
});

const getBucket = () => {
    return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'riskImages'
    });
}

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


// app.post('/risk-assessments', async (req, res) => {
//     const riskAssessment = await RiskAssessment.create(req.body);
//     res.json(riskAssessment);
// })

app.post('/risk-assessments', async (req, res) => {
  try {
    const riskAssessment = await RiskAssessment.create(req.body);
 
    try {
        await riskAssessment.populate('user');
      const dealId = await createProposalDeal(riskAssessment);
      riskAssessment.bitrixDealId = dealId;
      await riskAssessment.save();
      console.log(`Bitrix24 хэлцэл амжилттай үүсгэгдлээ (RA #${riskAssessment.id}, Deal ID: ${dealId})`);
    } catch (e) {
      console.error(`Bitrix24 хэлцэл үүсгэж чадсангүй (RA #${riskAssessment.id}):`, e.message);
    }
 
    res.json(riskAssessment);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Хадгалж чадсангүй' });
  }
});

app.get('/insurance-products', async (req, res) => {
    const insuranceProducts = await InsuranceProduct.find();
    res.json( insuranceProducts );
})

app.get('/risk-assessments', verifyToken, async (req, res) => {
    const id = req.user.id

    const riskAssessments = await RiskAssessment.find({user: id}).populate('selectedInsurance');
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
        const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '10s' });
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
    const imageId = (await RiskAssessment.findById(id)).risks.flatMap(risk => risk.images);
    const image = await RiskImage.findById(imageId);

        if (image) {
            if (image.gridFsId) {
                const bucket = getBucket();

                const file = await bucket
                    .find({ _id: image.gridFsId })
                    .next();

                if (file) {
                    await bucket.delete(image.gridFsId);
                    console.log(`GridFS file with ID ${image.gridFsId} deleted successfully.`);
                }
            }

            await RiskImage.findByIdAndDelete(imageId);
        }

        if(id) {await RiskAssessment.findByIdAndDelete(id)}
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

app.get('/all-risk-assessments', async (req, res) => {
    const riskAssessments = await RiskAssessment.find().populate('user');
    res.json(riskAssessments);
})

app.post('/price-offers', async (req, res) => {
    try{
        const priceOffer = await PriceOffer.create(req.body);
        res.json(priceOffer);
          try {
            await priceOffer.populate('user');
            const dealId = await createPriceOfferDeal(priceOffer);
            priceOffer.bitrixDealId = dealId;
            await priceOffer.save();
            console.log(`Bitrix24 хэлцэл амжилттай үүсгэгдлээ (RA #${priceOffer.id}, Deal ID: ${dealId})`);
            } catch (e) {
            console.error(`Bitrix24 хэлцэл үүсгэж чадсангүй (RA #${priceOffer.id}):`, e.message);
            }
    } catch (error) {
        console.error('Error creating price offer', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})



app.get('/all-price-offers', verifyToken, async (req, res) => {
    try{
        const userId = req.user.id;

        if(!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const priceOffers = await PriceOffer.find({ user: userId }).populate('priceOffers.insuranceId');
        res.json(priceOffers);
    }
    catch(error){
        console.error('Error fetching price offers', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.get('/priceOffers/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const priceOffer = await PriceOffer.findById(id).populate('priceOffers.insuranceId');
        res.json(priceOffer);
    }
    catch(error){
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.put('/priceOffers/:id', async (req, res) => {
    try{
        const id = req.params.id;
        const updateData = req.body;
        await PriceOffer.findByIdAndUpdate(id, updateData, { new: true });
        res.json({ success: true });
    }
    catch(error){
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.delete('/priceOffers/:id', async (req, res) => {
    try{
        const id = req.params.id;
        await PriceOffer.findByIdAndDelete(id);
        res.json({ success: true });
    }
    catch(error){
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

app.post("/upload", upload.single("image"), async (req, res) => {
    try{
        if(!req.file) {
            return res.status(400).json({ success: false, message: 'Зураг оруулаагүй байна' });
        }

        const bucket = getBucket();
        const filename = `${Date.now()}-${req.file.originalname}`;
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: req.file.mimetype,
        });

        Readable.from(req.file.buffer).pipe(uploadStream).on("error", async (err) => {
            console.error("Error uploading file to GridFS:", err);
            res.status(500).json({ success: false, message: "Зураг хадгалахад алдаа гарлаа" });
        }).on("finish", async () => {
            const riskImage = new RiskImage({
                filename: filename,
                originalName: req.file.originalname,
                contentType: req.file.mimetype,
                size: req.file.size,
                gridFsId: uploadStream.id,
            });
            await riskImage.save();
            res.json(riskImage);
        });
    } catch (error) {
        console.error("Error uploading file:", error);
        res.status(500).json({ success: false, message: "Зураг хадгалахад алдаа гарлаа" });
    }
})

app.get('/images/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Буруу зураг ID' });
    }

    const riskImage = await RiskImage.findById(id);
    if (!riskImage) {
      return res.status(404).json({ success: false, message: 'Зураг олдсонгүй' });
    }

    res.set('Content-Type', riskImage.contentType);
    res.set('Cache-Control', 'public, max-age=86400');

    const bucket = getBucket();
    bucket
      .openDownloadStream(riskImage.gridFsId)
      .on('error', (err) => {
        console.error('GridFS download error:', err);
        if (!res.headersSent) res.status(500).end();
      })
      .pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.delete('/images/:id', async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Буруу зураг ID' });
        }
        await RiskImage.findByIdAndDelete(id);
        res.json({ success: true, message: "Зураг амжилттай устгагдлаа" });
    } catch (error) {
        console.error("Error deleting image:", error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "Error deleting image" });
        }   
    }
});

app.post('/additional-services', async (req, res) => {
    try {
        const { name } = req.body;
        const additionalService = new AdditionalService({ name });
        await additionalService.save();
        res.json(additionalService);
    } catch (error) {
        console.error("Error creating additional service:", error);
        res.status(500).json({ success: false, message: "Error creating additional service" });
    }
});

app.get('/additional-services', async (req, res) => {
    try {
        const services = await AdditionalService.find();
        res.json(services);
    }
    catch (error) {
        console.error("Error fetching additional services:", error);
        res.status(500).json({ success: false, message: "Error fetching additional services" });
    }
})

app.delete('/additional-services/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await AdditionalService.findByIdAndDelete(id);
        res.json({ success: true, message: "Additional service deleted successfully" });
    } catch (error) {
        console.error("Error deleting additional service:", error);
        res.status(500).json({ success: false, message: "Error deleting additional service" });
    }
});

module.exports = app;