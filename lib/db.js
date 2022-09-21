'use strict';

// imports

const { ServerApiVersion } = require('mongodb');
const mongo = require('mongodb').MongoClient;

// functions
const url = 'mongodb+srv://havendev:MJlqni7RGniRPDqS@overseer.niquy.mongodb.net/havenswap?retryWrites=true&w=majority';

const database = {};

database.new = (userData, collection) => {
	return new Promise ((resolve, reject) => {
		mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true , serverApi: ServerApiVersion.v1 }, async function(err, client) {
			if (err) return reject(err);
			const db = client.db('dao-db');
			await db.collection(collection).insertOne(userData);
			client.close();
			return resolve(true);
		});
	});
};

database.update = (searchData, userData, collection) => {
	return new Promise ((resolve, reject) => {
		mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, async function(err, client) {
			if (err) return reject(err);
			const db = client.db('dao-db');
			await db.collection(collection).replaceOne(searchData, userData);
			client.close();
			return resolve(true);
		});
	});
};

database.find = (searchData, collection) => {
	return new Promise ((resolve, reject) => {
		mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 }, async function(err, client) {
			if (err) return reject(err);
			const db = client.db('dao-db');
			const results = await db.collection(collection).findOne(searchData);
			client.close();
			return resolve(results);
		});
	});
};

database.findLatestEntries = (collection, limit) => {
	return new Promise ((resolve, reject) => {
		mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true }, async function(err, client) {
			if (err) return reject(err);
			const db = client.db('dao-db');
			await db.collection(collection).find().sort({'timestamp':-1}).limit(limit).toArray(function(err, result) {
				if (err) return reject(err);
				client.close();
				return resolve(result);
			});
		});
	});
};

database.findAll = (collection) => {
	return new Promise((resolve, reject) => {
		mongo.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1}, async function(err, client) {
			if (err) return reject(err);
			const db = client.db('dao-db');
			await db.collection(collection).find({}).toArray(function(err, result) {
				if (err) return reject(err);
				client.close();
				return resolve(result);
			});
		});
	});
};

module.exports = database;