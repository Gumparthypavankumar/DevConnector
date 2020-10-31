const express = require("express");
const { check, validationResult } = require("express-validator");
const auth = require("../../middleware/auth");
const router = express.Router();

//Loading Models
const User = require('../../models/User');
const Profile = require('../../models/Profile');
const Post = require('../../models/Post');

// @route POST api/posts
// @desc Adding a post to registered user
// @access Private
router.post(
  "/",
  [auth, [check("text", "Text is Required").not().isEmpty()]],
  (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({ errors : errors.array()});
    }
    User.findById(req.user.id).select('-password')
    .then(user => {
        const newPost = {
            text:req.body.text,
            user:user.id,
            name:user.name,
            avatar:user.avatar
        }
        new Post(newPost).save()
        .then(post => {
            return res.json(post)
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ msg : 'Server Error'});
        })
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ msg : 'Server Error'});
    })
  }
);

// @route Get api/posts
// @desc Get all posts
// @access Private
router.get('/',auth,(req,res)=>{
    Post.find().sort({ date : -1})
    .then(posts => {
        return res.json(posts);
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ msg : 'Server Error'});
    })
});

// @route Get api/posts/:post_id
// @desc Get post by id
// @access Private
router.get('/:post_id',auth,(req,res)=>{
    Post.findById(req.params.post_id)
    .then(post => {
        if(!post){
            return res.status(404).json({ msg : 'Post Not Found'});
        }
        return res.json(post);
    })
    .catch(err => {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg : 'Post Not Found'});
        }
        return res.status(500).json({ msg : 'Server Error'});
    })
});

// @route DELETE api/posts
// @desc delete post by id
// @access Private
router.delete('/:post_id',auth,(req,res)=>{
    Post.findById(req.params.post_id)
    .then(post => {
        if(!post){
            return res.status(404).json({ msg : 'Post Not Found'});
        }
        if(req.user.id === post.user.toString()){
            post.remove()
            .then(post => {
                return res.json({ msg : 'Post Deleted'})
            })
            .catch(err => {
                console.log(err);
                if(err.kind === 'ObjectId'){
                    return res.status(404).json({ msg : 'Post Not Found'});
                }
                return res.status(500).json({ msg : 'Server Error'});
            })
        }
        else{
            return res.status(403).json({ msg : 'Access Denied'})
        }
    })
    .catch(err => {
        console.log(err);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg : 'Post Not Found'});
        }
        return res.status(500).json({ msg : 'Server Error'});
    })
});

// @route PUT api/posts/like/:post_id
// @desc Like a post
// @access Private
router.put('/like/:post_id',auth,(req,res)=>{
    Post.findById(req.params.post_id)
    .then(post => {
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ msg : 'Post already liked'});
        }
        post.likes.unshift({ user : req.user.id});
        post.save()
        .then(post => {
            return res.json(post.likes);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ msg : 'Server Error'});
        })
    })
    .catch(err => {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg : 'No Post Found'})
        }
        return res.status(500).json({ msg : 'Server Error'});
    })
});

// @route PUT api/posts/unlike/:post_id
// @desc Remove like for a post
// @access Private
router.put('/unlike/:post_id',auth,(req,res)=>{
    Post.findById(req.params.post_id)
    .then(post => {
        if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){
            return res.status(400).json({ msg : 'Post Not Yet Liked'});
        }
        const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);
        post.likes.splice(removeIndex,1);
        post.save()
        .then(post => {
            return res.json(post.likes);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ msg : 'Server Error'});
        })
    })
    .catch(err => {
        console.error(err);
        if(err.kind === 'ObjectId'){
            return res.status(404).json({ msg : 'No Post Found'})
        }
        return res.status(500).json({ msg : 'Server Error'});
    })
});

// @route POST api/posts/comment/:post_id
// @desc Adding a comment for post
// @access Private
router.post(
    "/comment/:post_id",
    [auth, [check("text", "Text is Required").not().isEmpty()]],
    (req, res) => {
      const errors = validationResult(req);
      if(!errors.isEmpty()){
          return res.status(400).json({ errors : errors.array()});
      }
      User.findById(req.user.id).select('-password')
      .then(user => {
          const newComment = {
              text:req.body.text,
              user:req.user.id,
              name:user.name,
              avatar:user.avatar
          };
          Post.findById(req.params.post_id)
          .then(post => {
            post.comments.unshift(newComment);
            post.save()
            .then(post => {
                return res.json(post.comments);
            })
            .catch(err => {
                console.error(err);
                return res.status(500).json({ msg : 'Server Error'});
            })
          })
          .catch(err => {
              console.error(err);
              return res.status(500).json({ msg : 'Server Error'});
          })
      })
      .catch(err => {
          console.error(err);
          return res.status(500).json({ msg : 'Server Error'});
      })
    }
  );

// @route DELETE api/posts/comment/:post_id/:comment_id
// @desc Delete Comment
// @access Private
router.delete('/comment/:post_id/:comment_id',auth,(req,res)=>{
    Post.findById(req.params.post_id)
    .then(post => {
        const comment = post.comments.find(comment => comment.id === req.params.comment_id);
        // Make Sure Comment Excists
        if(!comment){
            res.status(404).json({ msg : 'Comment Does Not Excist'});
        }
        //Check user
        if(comment.user.toString() !== req.user.id){
            return res.status(401).json({ msg : 'User Not Authorized'});
        }
        const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);
        post.comments.splice(removeIndex,1);
        post.save()
        .then(post => {
            return res.json(post.comments);
        })
        .catch(err => {
            console.error(err);
            return res.status(500).json({ msg : 'Server Error'});
        })
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({ msg : 'Server Error'});
    })
});

module.exports = router;
