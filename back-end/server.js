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

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const cookieSession = require('cookie-session');
app.use(cookieSession({
    name: 'session',
    keys: ['secretValue'],
    cookie: {
        maxAge: 24 * 60 * 60 * 1000
    }
}));

const postSchema = new mongoose.Schema({
    subreddit: String,
    icon: String,
    text: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    image: String,
    date: String,
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
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

let users = require("./users.js");
const validUser = users.valid;
app.use("/api/users", users.routes);

app.post('/api/photos', validUser, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.sendStatus(400);
    }
    res.send({
        path: "/images/" + req.file.filename
    });
});

app.post('/api/:subreddit/post', validUser, async (req, res) => {
    const post = new Post({
        subreddit: req.params.subreddit,
        icon: `/public/images/icons/${req.params.subreddit}.jpg`,
        text: req.body.text,
        user: req.user,
        image: req.body.image,
        date: Date.now().toString(),
        comments: [],
        title: req.body.title,
        points: 0,
    });
    try {
        await post.save();
        post.populate('user');
        res.send(post);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

async function populateComments(post) {
    let loadedComments = [];
    for (commentID of post.comments) {
        let comment = await Comment.findOne({ _id: commentID }).populate("user");
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
        let reply = await Comment.findOne({ _id: replyID }).populate("user");
        if (!reply) { console.log(`ERROR :: Reply ${replyID} not found`); continue; }
        await populateReplies(reply);
        loadedReplies.push(reply)
    }
    comment.replies = loadedReplies;
}

app.get('/api/posts', async (req, res) => {
    try {
        let posts = await Post.find().populate("user");
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
        let post = await Post.findOne({ _id: req.params.id }).populate("user");
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
        let posts = await Post.find({ subreddit: req.params.subreddit }).populate("user");
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

app.post('/api/replyToPost/:id', validUser, async (req, res) => {
    try {
        let comment = new Comment({
            points: 0,
            user: req.user, // from middleware
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

app.post('/api/replyToComment/:id', validUser, async (req, res) => {
    try {
        let parent = await Comment.findOne({ _id: req.params.id });
        if (!parent) {
            res.sendStatus(404);
        }
        let comment = new Comment({
            points: 0,
            user: req.user,
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

app.put('/api/editComment/:id', validUser, async (req, res) => {
    try {
        let comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) { res.sendStatus(404); return; }
        if (comment.user.toHexString() !== req.user._id.toHexString()) { res.sendStatus(403); return; }
        comment.text = req.body.text;
        await comment.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

async function getReplyIDs(parent, ids) {
    for (childID of parent.replies) {
        ids.push(childID);
        let childComment = await Comment.findOne({ _id: childID });
        getReplyIDs(childComment, ids);
    }
}

app.delete('/api/editComment/:id', validUser, async (req, res) => {
    try {
        let comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) { res.sendStatus(404); return; }
        if (comment.user.toHexString() !== req.user._id.toHexString()) { res.sendStatus(403); return; }
        let ids = [comment._id];
        await getReplyIDs(comment, ids);
        await Comment.updateMany({}, { $pull: { replies: comment._id } });
        await Post.updateMany({}, { $pull: { comments: comment._id } });
        await Comment.deleteMany({ _id: { $in: ids } });
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/upvotePost/:id', validUser, async (req, res) => {
    try {
        let post = await Post.findOne({ _id: req.params.id });
        if (!post) { res.sendStatus(404); return; }
        post.points++;
        await post.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/downvotePost/:id', validUser, async (req, res) => {
    try {
        let post = await Post.findOne({ _id: req.params.id });
        if (!post) { res.sendStatus(404); return; }
        post.points--;
        await post.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/upvoteComment/:id', validUser, async (req, res) => {
    try {
        let comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) { res.sendStatus(404); }
        comment.points++;
        await comment.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.post('/api/downvoteComment/:id', validUser, async (req, res) => {
    try {
        let comment = await Comment.findOne({ _id: req.params.id });
        if (!comment) { res.sendStatus(404); }
        comment.points--;
        await comment.save();
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

app.listen(3005, () => console.log('Server listening on port 3005!'));
