import { useRouteError, isRouteErrorResponse, Link } from "react-router";
export default function ErrorPage() {
  const error = useRouteError();
  console.log(error);

  return (
    <div id="error-page">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p>
        <i>
          {isRouteErrorResponse(error)
            ? `${error.status}: ${error.statusText}`
            : "Unknown Error Message"}
        </i>
      </p>
      <Link to="/">
        <span className="underline">Homepage</span>
      </Link>
    </div>
  );
}
