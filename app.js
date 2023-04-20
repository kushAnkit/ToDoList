const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash");


const app = express();
app.set('view engine','ejs');
const workItems = [];


app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://kushwahankit410:kushAnkit123@nomad.ujg90r5.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemsSchema = {
  name:String
};
const Item = mongoose.model("Item",itemsSchema);
const item1 = new Item({
  name:"Welcome to your todolist!!!"
});
const item2 = new Item({
  name:"click + button to add a new item"
});
const item3 = new Item({
  name:"<<<-- Hit this to delete item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/", function(req,res){

Item.find({},function(err,foundItems){
  if(foundItems.length === 0){
    Item.insertMany(defaultItems,function(err){
      if(err){
        console.log(err);
      }
      else{
        console.log("Successfully saved all items!");
      }
    });
    res.redirect("/");
  }
  else{
  res.render("list",{listTitle:"Today" , newListItems:foundItems});
  }
});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });

 
if(listName==="Today"){
  item.save();
  res.redirect("/");
}
else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
  

}
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});




app.get("/:postName",function(req,res){
  const customListname = _.capitalize(req.params.postName);

  List.findOne({name:customListname},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name:customListname,
          items:defaultItems
        });
        list.save();
      }
      else{
        res.render("list",{listTitle:foundList.name , newListItems:foundList.items});
      }
    }
  });
});
  




app.listen(3000, function(req,res){

  console.log("Server has started running on port 3000");
});
