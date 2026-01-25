// components/ErrorPage.jsx
const ErrorPage = ({ error, resetErrorBoundary }) => {
  return (
    <div className="error-page container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 text-center">
          <div className="error-icon mb-4">🚫</div>
          <h1 className="display-4 fw-bold mb-3">Something went wrong</h1>
          <p className="lead mb-4">
            {error?.message || "An unexpected error occurred"}
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <button 
              className="btn btn-lg" 
              onClick={resetErrorBoundary}
            >
              Try Again
            </button>
            <a href="/" className="btn btn-outline-secondary btn-lg">
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
