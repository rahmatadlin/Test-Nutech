const router = require("express").Router();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger-output.json");

router.use("/api-docs", swaggerUi.serve);
router.get("/api-docs", swaggerUi.setup(swaggerDocument));
const Controller = require("../controllers/controller");
const authentication = require("../middlewares/authentication");

// Endpoint ini tanpa perlu melewati authentication
router.post("/register", Controller.register);
router.post("/login", Controller.login);

// router.use(authentication); // Perlu dilakukan authentication terlebih dahulu

router.get("/products", Controller.getProducts);
router.post("/products", Controller.postProduct);
router.put("/products/:id", Controller.updateProduct);
router.delete("/products/:id", Controller.deleteProduct);

module.exports = router;
