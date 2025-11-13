import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { loginUserApi, type LoginUser } from "../apiCalls/auth";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../redux-store/store";
import Loader from "../components/Loader";
import { hideLoader, showLoader } from "../redux-store/loaderSlice";

const Login = () => {
  const loader = useSelector((state: RootState) => state.loader as boolean);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [user, setuser] = useState<LoginUser>({
    email: "",
    password: "",
  });
  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    dispatch(showLoader());
    try {
      const loginRequest = await loginUserApi(user);
      if (loginRequest.success) {
        toast.success(loginRequest.message);
        navigate("/home");
        localStorage.setItem("isLogin", "true");
      } else {
        toast.error(loginRequest.message);
      }
    } catch (err: unknown) {
      console.log(err);
    }
    dispatch(hideLoader());
  };

  useEffect(()=>{
    if(localStorage.getItem("isLogin")) navigate("/");
  },[]);
  return (
    <>
      {loader && <Loader /> }
      <div className="container-back-img"></div>
      <div className="container-back-color"></div>
      <div className="card-container">
        <div className="card">
          <div className="card_title">
            <h1>Login Here</h1>
          </div>
          <div className="form">
            <form onSubmit={(e) => handleLogin(e)}>
              <input
                type="email"
                placeholder="Email"
                value={user.email}
                onChange={(e) => setuser({ ...user, email: e.target.value })}
              />
              <input
                type="password"
                placeholder="Password"
                value={user.password}
                onChange={(e) => setuser({ ...user, password: e.target.value })}
              />
              <button>Login</button>
            </form>
          </div>
          <div className="card_terms">
            <span>
              Don't have an account yet?
              <Link to="/signup">Signup Here</Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
