import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { signupUserApi, type SignupUser } from "../apiCalls/auth";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux-store/store";
import Loader from "../components/Loader";
import { hideLoader, showLoader } from "../redux-store/loaderSlice";

const Signup = () => {
  const loader = useSelector((state: RootState) => state.loader as boolean);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setUser] = useState<SignupUser>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const onFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(showLoader());
    try {
      const signupRequest = await signupUserApi(user);
      if (signupRequest.success) {
        toast.success(signupRequest.message + " please login.!");
        navigate("/login");
      } else {
        toast.error(signupRequest.message);
      }
    } catch (err: unknown) {
      console.log(err);
    }
    dispatch(hideLoader());
  };
  return (
    <>
      {loader && <Loader />}
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card-container">
        <div className="card">
          <div className="card_title">
            <h1>Create Account</h1>
          </div>
          <div className="form">
            <form onSubmit={(e) => onFormSubmit(e)}>
              <div className="column">
                <input
                  type="text"
                  placeholder="First Name"
                  value={user.firstName}
                  onChange={(e) => {
                    setUser({ ...user, firstName: e.target.value });
                  }}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={user.lastName}
                  onChange={(e) => {
                    setUser({ ...user, lastName: e.target.value });
                  }}
                />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => {
                  setUser({ ...user, email: e.target.value });
                }}
              />
              <input
                type="password"
                placeholder="Password"
                value={user.password}
                onChange={(e) => {
                  setUser({ ...user, password: e.target.value });
                }}
              />
              <button>Sign Up</button>
            </form>
          </div>
          <div className="card_terms">
            <span>
              Already have an account?
              <Link to="/login">Login Here</Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
