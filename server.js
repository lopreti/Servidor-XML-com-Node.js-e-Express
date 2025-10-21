import express from "express";
import cors from "cors";
// import o body-parser - usado para interpretar o corpo (body) das 
// requisições, neste caso XML
import bodyParser from "body-parser";
// serve para converter XML em JSON e JSON em XML
import { parseStringPromise, Builder } from "xml2js";

const app = express();
app.use(cors());
app.use(bodyParser.text({ type: "application/xml" }));
// informa que o body das requisições será texto do tipo "application/xml"

// Essa função recebe o objeto JavaScript e converte para o XML
const jsonParaXml = (obj, root = "response") => {
    // cria um builder configurado para montar XML com cabeçalho padrão UTF-8
    const builder = new Builder({
        rootName: root, // Define o nome da tag raiz: <response></response>
        xmldec: { version: "1.0", encoding: "UTF-8" }
    });
    return builder.buildObject(obj);
};

let clientes = [];
let idCliente = 1;


let compras = []
let idCompra = 1;
app.get("/", (req, res) => {
    const mensagem = {
        message: "Hello World: Servidor XML funcionando",
        autor: "Vitor Lima",
        linguagem: "XML"
    };
    res.type("application/xml").send(jsonParaXml(mensagem));
});

app.post("/clientes", async (req, res) => {
    try {
        const xmlData = await parseStringPromise(req.body);

        const cliente = xmlData?.cliente || {};
        console.log(cliente);

        const nome = cliente.nome?.[0];
        const email = cliente.email?.[0];

        const novoCliente = {
            id: idCliente++,
            nome,
            email
        };

        clientes.push(novoCliente);

        res.status(201)
            .type("application/xml")
            .send(
                jsonParaXml({
                    message: "Cliente Cadastrado",
                    cliente: novoCliente
                })
            );

        console.log("Imprimindo apenas o nome: " + nome);
        console.log("Imprimindo apenas o email: " + email);
    } catch (error) {
        res.status(400)
            .type("application/xml")
            .send(jsonParaXml({ error: "XML inválido" }));
    }
});

app.get("/clientes", (req, res) => {
    res.type("application/xml").send(jsonParaXml(
        { clientes: { cliente: clientes } }
    ))
})

app.post("/compras", async (req, res) => {
    try {
        const xmlData = await parseStringPromise(req.body);
        const compra = xmlData?.compra || {}

        const produto = compra.produto?.[0]
        const valor = compra.valor?.[0]
        const clienteId = Number(compra.clienteId?.[0])

        const cliente = clientes.find((c) => c.id === Number(clienteId))

        if (!cliente) {
            return res.status(404).type('application/xml').send(jsonParaXml(
                { error: "cliente nao encontrado" }
            ))
        }

        const novaCompra = { id: idCompra++, produto, valor, clienteId }
        compras.push(novaCompra)

        res.status(201).type('application/xml').send(jsonParaXml(
            { message: "compra cadastrada", compra: novaCompra }
        ))
    } catch (error) {
        res.status(400).type('application/xml').send(jsonParaXml(
            { error: "xml invalido" }
        ))
    }
})
app.get("/compras", (req, res) => {
    res.type("application/xml").send(jsonParaXml(
        { compras: { compra: compras } }
    ));
});


const PORTA = 3000;
// inicializador do servidor 
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});
