const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const auth = require('../../middleware/auth');
const User = require('../../models/User');
// @GET api/auth
// @desc TestRoute
// @access Public
router.get('/',auth,(req,res)=>{
    User.findById(req.user.id).select('-password')
    .then(user => {
        return res.status(200).json(user);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ msg : 'Server Error'})
    })
})

// @route POST api/auth
// @desc Authorizing User & Get Token
// @access Public
router.post('/',[
    check('email','Please enter a valid email').isEmail(),
    check('password','Password is Required').exists()
],(req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()})
    }

    const { email,password} = req.body;

    User.findOne({email})
    .then(user => {
        if(!user){
            return res.status(400).json({ errors : [{ msg : 'Invalid Credentials'}]});
        }
        
        bcrypt.compare(password, user.password,(err, result) => {
            if(err){
                console.log(err);
                return res.status(400).json({errors :[{ msg : 'Invalid Credentials' }]})
            }
            if(result){
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
            }
            else{
                return res.status(400).json({errors :[{ msg : 'Invalid Credentials' }]})
            }
        });
    })
    .catch(err => res.send(500).send('Server Error'))
})
module.exports = router;