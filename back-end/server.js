const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

const mongoose = require('mongoose');

// connect to the database
mongoose.connect('mongodb://localhost:27017/reddit', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const postSchema = new mongoose.Schema({
    subreddit: String,
    icon: String, // subreddit icon
    text: String, // for text posts
    user: String, // String for now, eventually {type: mongoose.Schema.ObjectId, ref:'User'}
    image: String, // filepath to string
    date: String, // unix timestamp
    comments: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }
    ],
    title: String,
    points: Number,
});

postSchema.virtual('id')
    .get(function () {
        return this._id.toHexString();
    });

postSchema.set('toJSON', {
    virtuals: true
});

const commentSchema = new mongoose.Schema({
    points: Number,
    user: String, // TODO: make user table. Maybe AuthToken too.
    text: String,
    date: String,
    level: Number,
    replies: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment",
        }
    ],
});

commentSchema.virtual('id')
    .get(function () {
        return this._id.toHexString();
    });

commentSchema.set('toJSON', {
    virtuals: true
});

const Post = mongoose.model('Post', postSchema);
const Comment = mongoose.model('Comment', commentSchema);

const multer = require('multer');
const upload = multer({
    dest: '../public/images/', // TODO: Configure this for the setup
    limits: {
        fileSize: 10000000
    }
});

app.post('/api/photos', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.sendStatus(400);
    }
    res.send({
        path: "/images/" + req.file.filename
    });
});

app.post('/api/:subreddit/post', async (req, res) => {
    const post = new Post({
        subreddit: req.params.subreddit,
        icon: `/public/images/icons/${req.params.subreddit}.jpg`, // subreddit icon
        text: req.body.text, // for text posts
        user: req.body.user, // String for now, eventually {type: mongoose.Schema.ObjectId, ref:'User'}
        image: req.body.image, // filepath to string
        date: Date.now().toString(), // unix timestamp
        comments: [],
        title: req.body.title,
        points: 0,
    });
    try {
        await post.save();
        res.send(post);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

async function populateComments(post) {
    let loadedComments = [];
    for (commentID of post.comments) {
        let comment = await Comment.findOne({ _id: commentID });
        if (!comment) { console.log(`ERROR :: Comment ${commentID} not found`); continue; }
        await populateReplies(comment);
        loadedComments.push(comment);
    }
    post.comments = loadedComments;
}

async function populateReplies(comment) {
    if (comment === null || comment === undefined) { return; }
    let loadedReplies = [];
    for (replyID of comment.replies) {
        let reply = await Comment.findOne({ _id: replyID });
        if (!reply) { console.log(`ERROR :: Reply ${replyID} not found`); continue; }
        await populateReplies(reply);
        loadedReplies.push(reply)
    }
    comment.replies = loadedReplies;
}

app.get('/api/posts', async (req, res) => {
    try {
        let posts = await Post.find();
        for (post of posts) {
            await populateComments(post);
        }
        if (req.query.new) {
            posts.sort((post1, post2) => {
                let a = new Date(post1.date);
                let b = new Date(post2.date);
                return (a < b) - (a > b);
            });
        } else if (req.query.top) {
            posts.sort((post1, post2) => {
                let a = post1.points;
                let b = post2.points;
                return b - a;
            });
        }
        res.send(posts);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get('/api/post/:id', async (req, res) => {
    try {
        let post = await Post.findOne({ _id: req.params.id });
        if (!post) { res.sendStatus(404); }
        await populateComments(post);
        res.send(post);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.get('/api/:subreddit', async (req, res) => {
    try {
        let posts = await Post.find({ subreddit: req.params.subreddit });
        for (post of posts) {
            await populateComments(post);
        }
        if (req.query.new) {
            posts.sort((post1, post2) => {
                let a = new Date(post1.date);
                let b = new Date(post2.date);
                return (a < b) - (a > b);
            });
        } else if (req.query.top) {
            posts.sort((post1, post2) => {
                let a = post1.points;
                let b = post2.points;
                return b - a;
            });
        }
        res.send(posts);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/replyToPost/:id', async (req, res) => {
    try {
        let comment = new Comment({
            points: 0,
            user: req.body.user,
            text: req.body.text,
            date: Date.now().toString(),
            level: 0,
        });
        await comment.save(async (error, comment) => {
            if (error) { return; }
            await Post.findOneAndUpdate(
                { _id: req.params.id },
                { $push: { comments: comment } });
        });
        res.send({ id: comment._id });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/replyToComment/:id', async (req, res) => {
    try {
        let parent = await Comment.findOne({ _id: req.params.id });
        if (!parent) {
            res.sendStatus(404);
        }
        let comment = new Comment({
            points: 0,
            user: req.body.user,
            text: req.body.text,
            date: Date.now().toString(),
            level: parent.level + 1
        });
        await comment.save(async (error, comment) => {
            if (error) { return; }
            await parent.update({ $push: { replies: comment } });
        });
        res.send({ id: comment._id });
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.put('/api/editComment/:id', async (req, res) => {
    try {
        let comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) { res.sendStatus(404); }
        comment.text = req.body.text;
        await comment.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.delete('/api/editComment/:id', async (req, res) => {
    try {
        let comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) { res.sendStatus(404); }
        comment.deleted = true;
        comment.text = "";
        await comment.save();
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/upvotePost/:id', async (req, res) => {
    try {
        let post = await Post.findOne({ _id: req.params.id });
        if (!post) { res.sendStatus(404); }
        post.points++; // TODO: needs additional logic once we implement users
        await post.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/downvotePost/:id', async (req, res) => {
    try {
        let post = await Post.findOne({ _id: req.params.id });
        if (!post) { res.sendStatus(404); }
        post.points--; // TODO: needs additional logic once we implement users
        await post.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/upvoteComment/:id', async (req, res) => {
    try {
        let comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) { res.sendStatus(404); }
        comment.points++; // TODO: needs additional logic once we implement users
        await comment.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/downvoteComment/:id', async (req, res) => {
    try {
        let comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) { res.sendStatus(404); }
        comment.points--; // TODO: needs additional logic once we implement users
        await comment.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.listen(3001, () => console.log('Server listening on port 3001!'));
