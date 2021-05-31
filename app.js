const express = require("express");
const cookie = require('cookie');
const cookieSession = require('cookie-session')
const passport=require("passport");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const fetch=require("node-fetch")
const mongoose = require("mongoose");
const APP_HOSTNAME = '*';
const ADMIN_EMAIL = '07abhishekrock@gmail.com';

var findOrCreate = require('mongoose-findorcreate')
var ClickSchema = new mongoose.Schema({  
  noa:String,
  youtube_id:String,
  playlist_title:String
 });
ClickSchema.plugin(findOrCreate);
var youtube = mongoose.model('Youtube_data', ClickSchema);


require("./passport.js")
app.use(cors());
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
  if(req.user._json.email==ADMIN_EMAIL){
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
  if(req.user._json.email==ADMIN_EMAIL){
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

app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://Kem_palty:trivedi@adhiraj123@cluster0.cw41k.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true,});
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

const CategoryBlogsSchema = new mongoose.Schema({
  categoryName : String,
})
// const youtubeSchema=new mongoose.Schema({
 
// })

const blogentry = mongoose.model("Blog_data", blogSchema);
const subscriber=new mongoose.model("Suscriber_List",subscriberSchema);
const categoryBlogs = new mongoose.model("Category_Blogs",CategoryBlogsSchema);
//const youtube=new mongoose.model("Youtube_data",youtubeSchema);
/************************************************API FOR BLOGS******************************************************* */
app.post("/api/subscriber",(req,res)=>{
  try{
    console.log('email' , req.body.entered_email);
  const subscriberentry = new subscriber({
    email_data:req.body.entered_email,
  })

  subscriberentry.save()
  res.status(201).set('Access-Control-Allow-Origin', '*').json({
    status:"success",
    data:{subscriberentry}
  })  
}
catch(error){
  console.log(error);
  res.status(201).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
    status:false , errorString : error
  })
}
})

// route for posting new subscriber -------------------------------------------------
app.get("/api/subscriber",isLoggedIn, async(req,res)=>{
  try{
    const foundSubscriber= await subscriber.find(function(err,data){
      console.log("");
    })
      res.status(200).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
        status:"success",
        data:{foundSubscriber}
    })
  }
  catch(error){
    console.log(error);
  }
})
// ends here ---------------------------------------------------------------------------


//route for adding new Category --------------------------------------------------------
app.post("/api/addCategory",  async (req, res) => {

  try{
    const NewCategoryName = req.body.categoryName;

    //check if category is empty
    if(!NewCategoryName){

      res.set('Access-Control-Allow-Origin',APP_HOSTNAME).json({status:'failure',errorString:'Empty Categories Not Allowed'});
      return;

    }

    //check if category already exists
    const AlreadyExistingCategory = await categoryBlogs.find({
      categoryName : NewCategoryName
    },(err)=>{
      if(err){
        console.log(err);
      }
    })

    if(AlreadyExistingCategory.length > 0){

      //send error response
      res.set('Access-Control-Allow-Origin' , APP_HOSTNAME)
      .json({status:'failure',errorString:'Category Already Exists'});

    }
    else{

      //if new and unique create a new entry in database

      const addCategory = new categoryBlogs({
        categoryName : NewCategoryName
      });

      addCategory.save()

      //send success response with data
      res.status(201).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
        status: "success",
        data: {
          category:NewCategoryName
        },
      });

    }
  }
  catch(e){
    console.log(e);
    res.set('Access-Control-Allow-Origin',APP_HOSTNAME).json({status:'failure',errorString:e});
  }

})
//ends here -----------------------------------------------------------------------------


//get all categories --------------------------------------------------------------------
app.get("/api/categoryList", async (req, res)=>{

  try{
    let data = await categoryBlogs.find({} , (err)=>{if(err) console.log(err)});
    res.set('Access-Control-Allow-Origin',APP_HOSTNAME).json({status:'success',data:data});
  }

  catch(e){
    console.log(e);
    res.set('Access-Control-Allow-Origin',APP_HOSTNAME).json({status:'failure',errorString:'some error occurred'});
  }
})
//ends here ---------------------------------------------------------------------------------

//create a new blog using post
app.post("/api/blog", isLoggedIn,async (req, res) => {
  try {
    const { body } = req;

    let categories_in_database = await categoryBlogs.find({categoryName : req.body.categoryblog});
    if(categories_in_database.length === 0){
      const addCategory = new categoryBlogs({
        categoryName : req.body.categoryblog
      })
      console.log(addCategory);
      addCategory.save();
    }

    //create a new entry
    const addBlog = new blogentry({
      date: req.body.publishedonpubblog,
      category: req.body.categoryblog,
      title: req.body.title,
      content: req.body.desc,
      readingtime: req.body.timeblog,
      coverphoto: req.body.coverphotoblog,
    });
    addBlog.save();

    //send success response upon completion
    res.status(201).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
      status: "success",
      data: {
        addBlog,
      },
    });

  } catch (error) {
    console.log(error);
  }
});
//ends here --------------------------------------------------------------------

//get all blogs ****Not to Be Used**** -----------------------------------------
app.get("/api/blog", (req, res) => {
  try {
    blogentry.find(function (err, data) {
      if (err) {
        res.status(404).set('Access-Control-Allow-Origin', APP_HOSTNAME).send("Data Not Found");
      }
      res.status(200).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
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

//route ends here -----------------------------------------------------------------



//get blog with unique id ---------------------------------------------------------
app.get("/api/blog/:id", async (req, res) => {
  try {
    const single_blog = await blogentry.findById(
      req.params.id,
      function (err, data) {
        console.log(data);
      }
    );
    res.status(200).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
      status: "success",
      single_blog
    });
  } catch (error) {
    console.log(error);
  }
});
//ends here --------------------------------------------------------------------------------


//update blog route ------------------------------------------------------------------------
app.patch("/api/blog/:id",isLoggedIn, async (req, res) => {
  try {

    let categories_in_database = await categoryBlogs.find({categoryName : req.body.categoryblog});
    if(categories_in_database.length === 0){
      const addCategory = new categoryBlogs({
        categoryName : req.body.categoryblog
      })
      addCategory.save();
    }

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
    //send success response
    res.status(201).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
      status: "success",
      data: {
        update_single_blog
      },
    });
    
  } catch (error) {
    console.log(error);
  }
});
//route ends here --------------------------------------------------------------------



//route for finding blog based on a special category passed ------------------------
//this is a paginated version -----------------------------------------------------
app.get("/api/FindBlogByCategory/:categoryName", async (req , res) => {
  try{
    const categoryName = req.params.categoryName;
    const page = Number(req.query.page) || 0;
    const limit = Number(req.query.limit) || 5;
    const VALUES_PER_PAGE = 6;

    if(!categoryName){
      res.set('Access-Control-Allow-Origin',APP_HOSTNAME).json({status:'failure',errorString:'Specify some category.'});
      return;
    }

    //find the blogs pertaining to that category
    let data = await blogentry.find({
      category : categoryName
    },(err)=>{
      if(err){
        console.log(err);
      }
    }).skip(page * VALUES_PER_PAGE).limit(limit).select('date category title readingtime coverphoto');

    res.set('Access-Control-Allow-Origin',APP_HOSTNAME).json({status:'success',
      data
    });

  }
  catch(e){
    res.set('Access-Control-Allow-Origin',APP_HOSTNAME).json({status:'failure',errorString:e});
    console.log(e);
  }
})
//route ends here ----------------------------------------------------------------


// app.get("/api/blog/category/:category", async (req, res) => {
//   try {
//     const single_blog = await blogentry.find(
//       {
//         category: req.params.category,
//       },
//       function (err, data) {
//         console.log(data);
//       }
//     );
//     res.status(200).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
//       status: "success",
//       data: {
//         single_blog,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });


//delete a blog using a id passed  -----------------------------------------------------
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
    res.status(200).set('Access-Control-Allow-Origin', APP_HOSTNAME).json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
  }
});
//route ends here -------------------------------------------------------


/******************************************************************************************************************************** */

/**********************************************************ALL ROUTES********************************************************** */

//render and login routes begin here

app.get("/check",(req,res)=>{
  try{
  if(req.user._json.email==ADMIN_EMAIL){
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
    if(req.user._json.email===ADMIN_EMAIL){
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

app.get("/editblog/:id",isLoggedIn, async (req, res) => {
  let categories = await categoryBlogs.find({});
  await blogentry.findById(req.params.id, function (err, data) {

    res.render("editBlog", {
      data: data,
      categories:categories
    });

  });
});

app.get("/createblog",isLoggedIn, async (req, res) => {

  let categories = await categoryBlogs.find({});

  res.render("createblog" , {categories});
});
app.get("/subscriberlist",isLoggedIn,(req,res)=>{
  res.render("subscriberList")
})
app.get("/ytplaylistupdate",isLoggedIn,(req,res)=>{
  res.render("YTplaylist");
})

app.post("/updateyt",isLoggedIn, async (req,res)=>{
  count=0;
 go(`https://youtube.googleapis.com/youtube/v3/playlists?key=AIzaSyCwRP6-HU_B6M7vOBG4626TkK5SEBR0Ojs&channelId=UCNaST5ZYBVjPOzhzU9lA7XA&part=snippet`);
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
    sameurl=`https://youtube.googleapis.com/youtube/v3/playlists?key=AIzaSyCwRP6-HU_B6M7vOBG4626TkK5SEBR0Ojs&channelId=UCNaST5ZYBVjPOzhzU9lA7XA&pageToken=${token}&part=snippet`
    await go(sameurl);
}
  }
})
app.listen(process.env.PORT || "3000", function () {
  console.log("Started at port 3000");
});
