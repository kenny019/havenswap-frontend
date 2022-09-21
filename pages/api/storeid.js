// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

import { verify, sign } from 'jsonwebtoken';

import Cookie from 'cookie';

export default function handler(req, res) {
	if (!req.method === 'POST') {
		return res.status(400).end();
	}

	const { wallet, update } = req.body;

	if (!wallet) {
		return res.status(400).json({message: 'Invalid request'});
	}

	try {

		if (!update) {
			res.setHeader('Set-Cookie', Cookie.serialize('token', '', {
				httpOnly: true,
				sameSite: 'strict',
				path: '/',
				maxAge: -1,
			}));

			return res.status(200).json();
		}

		const savedData = {
			accountId: wallet,
		};

		const token = sign(savedData, 'havenswap369-token', { expiresIn: '7d' });

		res.setHeader('Set-Cookie', Cookie.serialize('token', token, {
			httpOnly: true,
			sameSite: 'strict',
			path: '/',
			maxAge: 3600,
			secure: false,
		}));

		return res.status(200).json();
	}
	catch(err) {
		console.log(err)
	}
	
}
