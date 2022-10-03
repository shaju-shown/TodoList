//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash")


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// creating new database. and connecting
mongoose.connect("mongodb+srv://shownshaju:ZrWs7SYChhcg2vIJ@cluster0.bpbac.mongodb.net/todolistDB", {useNewUrlParser: true});


// creaating schema
const itemsSchema = {     
  name : String
};

// creating mongoose model
const Item= mongoose.model("Item" , itemsSchema);

// creating document

const item1 = new Item({
 name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
 });

 const item3 = new Item({
  name: "<-- Hit this to delete an item."
 });

 const defaultItems=[item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemsSchema]
};

const List = mongoose.model("List", listSchema);



const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];

app.get("/", function(req, res) {
//checking if Items is empty




 Item.find({}, function(err,foundItems){
   if(foundItems.length === 0){
      
        Item.insertMany(defaultItems, function(err){
         if(err)
        {
           console.log(err);

        }else{
            console.log("Successfully inserted default item");
         }
        });
      res.redirect("/")
   }
  
  else { 
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
 }) 

  

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;
  

  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

/*
    Item.findByIdAndRemove(checkedItemId,function(err){
      console.log("Delete successfull");
    })
   res.redirect("/")*/
})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });

  if(listName=="Today"){
    newItem.save();
    res.redirect("/");


  }else{
    List.findOne({name:listName}, function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName)
    })
  }


/*
  if (req.body.list === "Work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }
  */
});
app.get("/:customListName", function(req,res){
    const customListName= _.capitalize(req.params.customListName);

    List.findOne({name:customListName},function(err,foundList){
      if(!err){
        if(!foundList){
          const list = new List({
            name:customListName,
            items:defaultItems
          });
          list.save(),
          res.redirect("/"+customListName)

        }
        else{
         res.render("list", {listTitle: foundList.name, newListItems:foundList.items})
        }
      }
    });
    
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000,function(){
  console.log("The server is running on port 3000");
});
