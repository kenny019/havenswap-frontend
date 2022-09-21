import Head from 'next/head';
import Navbar from '../components/Navbar';
import TradeMain from '../components/Trade';

import { useRouter } from 'next/router';

import { useState, useEffect } from 'react';
import { getWallet } from '../lib/near';

const Trade = ({ accountId, query }) => {
	const router = useRouter();
	const queries = router.query;
	const { transactionHashes, errorCode, errorMessage } = query;

	const [nearId, setNearId] = useState(accountId);

	useEffect(() => {
		if (query) {
			router.replace('/trade', undefined, { shallow: true });
		}
	}, []);

	return (
		<>
		<Head>
			<title>Trades</title>
		</Head>
		<Navbar nearId={nearId} setNear={setNearId}/>
		{<TradeMain nearId={nearId} query={queries}/>}
		</>
	)
}

export default Trade

import { verify, sign } from 'jsonwebtoken';

import Cookie from 'cookie';

export async function getServerSideProps(context) {
	const { req } = context;

	const { account_id, transactionHashes, errorCode, errorMessage } = context.query;

	const query = {
		transactionHashes: decodeURIComponent(transactionHashes) ?? null, errorCode: decodeURIComponent(errorCode) ?? null, errorMessage: decodeURIComponent(errorMessage) ?? null,
	}

	try {
		if (req.cookies.token) {
			const token = verify(req.cookies.token, 'havenswap369-token');

			if (token) {
				return {
					props: {
						accountId: token.accountId,
						query
					},
				}
			}
			else {
				return {
					props: {query},
				}
			}
		}


		if (account_id) {

			const savedData = {
				accountId: account_id,
				query
			};

			const token = sign(savedData, 'havenswap369-token', { expiresIn: '7d' });

			context.res.setHeader('Set-Cookie', Cookie.serialize('token', token, {
				httpOnly: true,
				sameSite: 'strict',
				path: '/',
				maxAge: 3600,
				secure: false,
			}));


			return {
				props: {
					accountId: account_id,
					query
				},
			}
		}

	
		return {
			props: {query},
		}
	}
	catch (err) {
		return {
			props: {},
		}
	}
}