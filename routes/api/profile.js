const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const normalize = require("normalize-url");
const auth = require("../../middleware/auth");
const request = require('request');
const config = require('config');
//Loading Models
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const Post = require("../../models/Post");

// @route GET api/profile/me
// @desc Get Current User Profile
// @access Private
router.get("/me", auth, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) return res.status(400).json({ msg: "There is No Profile" });
      return res.status(200).json(profile);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ msg: "Server Error" });
    });
});

//@route POST api/profile
//@desc Create or Update Profile
//@access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "status is required").not().isEmpty(),
      check("skills", "Skills are required").not().isEmpty(),
    ],
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      location,
      website,
      bio,
      skills,
      status,
      githubusername,
      youtube,
      twitter,
      instagram,
      linkedin,
      facebook,
    } = req.body;

    const ProfileFields = {
      user: req.user.id,
      company,
      location,
      website:
        website && website !== ""
          ? normalize(website, { forceHttps: true })
          : "",
      bio,
      skills: Array.isArray(skills)
        ? skills
        : skills.split(",").map((skill) => skill.trim()),
      status,
      githubusername,
    };

    // Build social object and add to profileFields
    const socialfields = { youtube, twitter, instagram, linkedin, facebook };
    for (let [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0) {
        socialfields[key] = normalize(value, { forceHttps: true });
      }
    }
    ProfileFields.social = socialfields;
    Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: ProfileFields },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    )
      .then((profile) => {
        res.json(profile);
      })
      .catch((err) => console.log(err));
  }
);

//@route GET api/profile
//@desc GET all Profiles
//@access Public
router.get("/", (req, res) => {
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then((profiles) => {
      if (!profiles) {
        res.json({ msg: "No Profiles" });
      }
      res.json(profiles);
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ msg: "Server Error" });
    });
});

//@route GET api/profile/user/:userid
//@desc GET Profile By userid
//@access Public
router.get("/user/:userid", (req, res) => {
  Profile.findOne({ user: req.params.userid })
    .populate("user", ["name", "avatar"])
    .then((profile) => {
      if (!profile) {
        return res.status(400).json({ msg: "Profile Not Found" });
      }
      return res.status(200).json(profile);
    })
    .catch((err) => {
      if (err.kind === "ObjectId") {
        return res.status(400).json({ msg: "Profile Not Found" });
      }
      console.log(err);
      return res.status(500).json({ msg: "Server Error" });
    });
});

//@route DELETE api/profile
//@desc  delete profile,user and posts
//@access Private

router.delete("/", auth, async (req, res) => {
  try {
    //Remove User Posts
    await Post.deleteMany({ user : req.user.id});
    //Remove Profile
    await Profile.findOneAndRemove({ user: req.user.id });
    //Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    return res.status(200).json({ msg: "User and Profile Deleted" });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ msg: "Server Error" });
  }
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is Required").not().isEmpty(),
      check("company", "Company is Required").not().isEmpty(),
      check("from", "From Date is Required").not().isEmpty(),
    ],
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        profile.experience.unshift(newExp);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: "Server Error" });
          });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ msg: "Server error" });
      });
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete experience from profile
// @access   Private

router.delete("/experience/:exp_id", auth, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      profile.experience = profile.experience.filter(
        (exp) => exp._id.toString() !== req.params.exp_id
      );
      profile
        .save()
        .then((profile) => {
          return res.json(profile);
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ msg: "Server Error" });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ msg: "Server Error" });
    });
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private

router.put(
  "/education",
  [
    auth,
    [
        check('school', 'School is required').not().isEmpty(),
        check('degree', 'Degree is required').not().isEmpty(),
        check('fieldofstudy', 'Field of study is required').not().isEmpty(),
        check('from', 'From date is required and needs to be from the past')
          .not()
          .isEmpty()
    ],
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      } = req.body;
  
      const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
      };

    Profile.findOne({ user: req.user.id })
      .then((profile) => {
        profile.education.unshift(newEdu);
        profile
          .save()
          .then((profile) => res.json(profile))
          .catch((err) => {
            console.error(err);
            return res.status(500).json({ msg: "Server Error" });
          });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ msg: "Server error" });
      });
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete education from profile
// @access   Private

router.delete("/education/:edu_id", auth, (req, res) => {
  Profile.findOne({ user: req.user.id })
    .then((profile) => {
      profile.education = profile.education.filter(
        (edu) => edu._id.toString() !== req.params.edu_id
      );
      profile
        .save()
        .then((profile) => {
          return res.json(profile);
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ msg: "Server Error" });
        });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ msg: "Server Error" });
    });
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public
router.get('/github/:username',(req,res)=>{
  try {
    const options = {
      uri:`https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubClientSecret')}`,
      method:'GET',
      headers:{ 'user-agent': 'node.js'}
  }
  request(options,(error,response,body)=>{
      if(error){
          console.error(error);
      }
      if(response.statusCode !== 200){
          return res.status(404).json({ msg : 'No Github Profile Found'})
      }

      return res.json(JSON.parse(body));
  })
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ msg : 'Server Error'});
  }
});
module.exports = router;
