const express = require("express");
const cookie = require('cookie');
const cookieSession = require('cookie-session')
const passport=require("passport");
const bodyParser = require("body-parser");
const app = express();
const fetch=require("node-fetch")
const mongoose = require("mongoose");

var findOrCreate = require('mongoose-findorcreate')
var ClickSchema = new mongoose.Schema({  
  noa:String,
  youtube_id:String,
  playlist_title:String
 });
ClickSchema.plugin(findOrCreate);
var youtube = mongoose.model('Youtube_data', ClickSchema);


require("./passport.js")
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(cookieSession({
  name: 'tutosession',
  keys: ['key1', 'key2']
}))
const isLoggedIn=(req,res,next)=>{
  try{
    console.log(req.user._json.email);  
  if(req.user._json.email==="ait.cear@gmail.com"){
    next();
  }
  else{
    res.redirect("/failed");
  }
}
  catch(error){
    res.redirect("/failed");
  }
}
const isLoggedInc=(req,res,next)=>{
  try{
    console.log("c",req.user._json.email);
  if(req.user._json.email==="ait.cear@gmail.com"){
    res.redirect("/redirect");
  }
  else{
    next();
  }
}
  catch(error){
    next();
  }
}
// const checkLogin=(req,res)={
//   if(re)
// }
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://AIT-CEAR:aitrobotics@1234@cluster0.4wa10.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true,});
mongoose.set("useFindAndModify", false);
const blogSchema = new mongoose.Schema({
  date: Date,
  category: String,
  title: String,
  content: String,
  readingtime: Number,
  coverphoto: String,
});

const subscriberSchema=new mongoose.Schema({
  email_data:String
})
// const youtubeSchema=new mongoose.Schema({
 
// })

const blogentry = mongoose.model("Blog_data", blogSchema);
const subscriber=new mongoose.model("Suscriber_List",subscriberSchema);
//const youtube=new mongoose.model("Youtube_data",youtubeSchema);
/************************************************API FOR BLOGS******************************************************* */
app.post("/api/subscriber",(req,res)=>{
  try{
  const subscriberentry = new subscriber({
    email_data:req.body.entered_email,
  })

  subscriberentry.save()
  res.status(201).json({
    status:"success",
    data:{subscriberentry}
  })  
}
catch(error){
  console.log(error);
}
})

app.get("/api/subscriber",isLoggedIn, async(req,res)=>{
  try{
  const foundSubscriber= await subscriber.find(function(err,data){
    console.log("");
  })
    res.status(200).json({
      status:"success",
      data:{foundSubscriber}
  })
}
catch(error){
console.log(error);
}
})

app.post("/api/blog", isLoggedIn,(req, res) => {
  try {
    const { body } = req;
    console.log(body);
    const addnews = new blogentry({
      date: req.body.publishedonpubblog,
      category: req.body.categoryblog,
      title: req.body.title,
      content: req.body.desc,
      readingtime: req.body.timeblog,
      coverphoto: req.body.coverphotoblog,
    });
    addnews.save();
    res.status(201).json({
      status: "success",
      data: {
        addnews,
      },
    });
  } catch (error) {
    console.log(error);
  }
});
app.get("/api/blog", (req, res) => {
  try {
    blogentry.find(function (err, data) {
      if (err) {
        res.status(404).send("Data Not Found");
      }
      res.status(200).json({
        status: "success",
        totalrecords: data.length,
        data: {
          data,
        },
      });
    });
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/blog/:id", async (req, res) => {
  try {
    const single_blog = await blogentry.findById(
      req.params.id,
      function (err, data) {
        console.log(data);
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        single_blog,
      },
    });
  } catch (error) {
    console.log(error);
  }
});
app.patch("/api/blog/:id",isLoggedIn, async (req, res) => {
  try {
    const update_single_blog = await blogentry.findByIdAndUpdate(
      req.params.id,
      {
        date: req.body.publishedonpubblog,
        category: req.body.categoryblog,
        title: req.body.title,
        content: req.body.desc,
        readingtime: req.body.timeblog,
        coverphoto: req.body.coverphotoblog,
      },function(err,data){
          if(err){
              console.log(err);
          }
      }
    );
    res.status(201).json({
      status: "success",
      data: {
        update_single_blog
      },
    });
    
  } catch (error) {
    console.log(error);
  }
});

app.get("/api/blog/category/:category", async (req, res) => {
  try {
    const single_blog = await blogentry.find(
      {
        category: req.params.category,
      },
      function (err, data) {
        console.log(data);
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        single_blog,
      },
    });
  } catch (error) {
    console.log(error);
  }
});

app.delete("/api/blog/delete/:id",isLoggedIn, async(req, res) => {
  try {
    await blogentry.deleteOne(
      {
        _id: req.params.id,
      },
      function (err) {
        if(err){
        console.log(data);
        }
      }
    );
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
  }
});
/******************************************************************************************************************************** */

/**********************************************************ALL ROUTES********************************************************** */
app.get("/check",(req,res)=>{
  try{
  if(req.user._json.email==="ait.cear@gmail.com"){
    res.redirect("/redirect")
  }
  else{
    res.redirect("/auth/google")
  }
}
catch{
  res.redirect("/auth/google")
}
})

app.get('/auth/google',isLoggedInc, passport.authenticate('google', { scope: ['profile','email'] }));

app.get('/auth/google/callback',passport.authenticate('google', { failureRedirect: '/failed' }),isLoggedIn,
  function(req, res) {
    //console.log(req.user._json);
    // Successful authentication, redirect home.
    res.redirect('/redirect');
  });

app.get("/failed",(req,res)=>{
  res.send("You are not allowed to use this site...!")
})
app.get("/logout",isLoggedIn,(req,res)=>{
  req.session=null;
  req.logout();
  res.redirect("/")

})

app.get("/", (req, res) => {
  //res.render("login")
  try{
    if(req.user._json.email==="ait.cear@gmail.com"){
      res.redirect("/redirect")
    }
    else{
      res.render("login")
    }
  }
  catch{
    res.render("login")
  }
});

app.get("/redirect",isLoggedIn, (req, res) => {
  res.render("index");
});

app.get("/editblog/:id",isLoggedIn, (req, res) => {
  blogentry.findById(req.params.id, function (err, data) {
    res.render("editBlog", {
      data: data,
    });
  });
});

app.get("/createblog",isLoggedIn, (req, res) => {
  res.render("createblog");
});
app.get("/subscriberlist",isLoggedIn,(req,res)=>{
  res.render("subscriberList")
})
app.get("/ytplaylistupdate",isLoggedIn,(req,res)=>{
  res.render("YTplaylist");
})

app.post("/updateyt",isLoggedIn, async (req,res)=>{
  count=0;
 go(`https://youtube.googleapis.com/youtube/v3/playlists?key=AIzaSyCwRP6-HU_B6M7vOBG4626TkK5SEBR0Ojs&channelId=UCvjgXvBlbQiydffZU7m1_aw&part=snippet`);
  async function go(checkapi){
  const apii=checkapi;
  const resp=await fetch(apii);
  const gg=await resp.json();
  for(let i=0;i<gg.items.length;i++){
    ++count
  await youtube.findOrCreate({youtube_id:gg.items[i].id},{playlist_title:gg.items[i].snippet.title},{noa:count},function(err, click, created) {
    console.log(gg.items[i].snippet.title);
  });
  //console.log(++count," ",gg.items[i].snippet.title);
  
}
if(gg.nextPageToken!=undefined){
  token=gg.nextPageToken;
    sameurl=`https://youtube.googleapis.com/youtube/v3/playlists?key=AIzaSyCwRP6-HU_B6M7vOBG4626TkK5SEBR0Ojs&channelId=UCvjgXvBlbQiydffZU7m1_aw&pageToken=${token}&part=snippet`
    await go(sameurl);
}
  }
})
app.listen(process.env.PORT || "5000", function () {
  console.log("Started at port 3000");
});
