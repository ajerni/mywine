/*
import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode: number }) {
  return JSON.stringify({ error: `An error ${statusCode} occurred on server` });
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
*/