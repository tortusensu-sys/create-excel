import express from 'express';

const PORT = 3001;

const app = express();

app.use(express.json());

app.get("/", (req, res)=>{
    res.send("hello world");
})

app.post("/create-excel", (req,res)=>{
    let contenx = req.body.faa;
    res.status(200).send({
        body: contenx
    }); 
})

app.listen(PORT, ()=>{
    console.log(`este es el ejemplo de  ${PORT}`)
})