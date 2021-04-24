const express = require('express');
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const router = express.Router();

const User = require('../../models/User');
// @route POST api/users
// @desc Register Route
// @access Public
router.post('/',[
    check('name','Name is Required').not().isEmpty(),
    check('email','Please enter a valid email').isEmail(),
    check('password','Password must be minimum of 6 characters').isLength({ min : 6})
],(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }

    const { name,email,password} = req.body;

    User.findOne({email})
    .then(user => {
        if(!user){
            //Getting user image
            const avatar = gravatar.url(email,{
                s:'200',
                r:'pg',
                d:'mm'
            });
            //Encrypting Password
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                new User({
                    name,
                    email,
                    password:hash,
                    avatar}).save()
                .then(user => {
                    const payload = {
                        user:{
                            id:user.id
                        }
                    };
                    jwt.sign(payload,config.get('jwtSecret'),{
                        expiresIn:360000
                        },(err,token)=>{
                            if(err)
                            throw err;
                            return res.json({token})
                        })
                    //return res.status(200).send('User Created')
                })
                .catch(err => {
                    return res.status(500).send('User not Created')
                })
                });
            });
        }
        else{
            return res.status(400).json({ errors : [{ msg : 'User Already Exists'}]})
        }
    })
    .catch(err => res.status(500).send('Server Error'))
})

module.exports = router;
