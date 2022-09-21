import useSWR from 'swr';


const getFetcher = (url) => fetch(url).then((res) => res.json());

export default function GetLikelyNFTs(nearId) {

	const { data, error } = useSWR(
		nearId && (nearId.endsWith('.near') || nearId.length >= 64) ? `https://helper.mainnet.near.org/account/${nearId}/likelyNFTs` : null,
		getFetcher,
	);
	
	const loading = !data && !error;

	return {
		loading,
		error,
		data,
	};
}