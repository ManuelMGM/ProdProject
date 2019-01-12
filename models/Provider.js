const { Sequelize, sequelize } = require('./db');

const dbProvider = sequelize.define('providers', {
    cuit: { type: Sequelize.BIGINT, allowNull: false, unique: true },
    name: { type: Sequelize.STRING, allowNull: false },
    razonSocial: { type: Sequelize.STRING },
    apellido: { type: Sequelize.STRING },
    email: { type: Sequelize.STRING, validate: { isEmail: true } }
});

class Provider {
    constructor() {
        this.create = async ({ cuit, name, razonSocial, apellido, email }) => {
            try {
                return sequelize
                .sync()
                .then(() =>
                dbProvider.create({
                    cuit,
                    name,
                    razonSocial,
                    apellido,
                    email
                })
            )
            .then(result => result);
            } catch (e) {
                console.error(e);
            }
        }

        this.getAll = () => {

            return dbProvider.findAll( {
                attributes: [ "cuit", "name", "razonSocial", "apellido", "email" ]
            });
        }



    }
}

module.exports = new Provider();