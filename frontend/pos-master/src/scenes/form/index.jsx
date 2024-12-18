import {
  Box,
  Button,
  Grid,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import useMediaQuery from "@mui/material/useMediaQuery";
import { tokens } from "../../theme";
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Keyboard from "./Keyboard";
import KeyboardOutlinedIcon from "@mui/icons-material/KeyboardOutlined";
import KeyboardIcon from "@mui/icons-material/Keyboard"; // Import the Keyboard icon
import IconButton from "@mui/material/IconButton";
import Cookies from 'js-cookie';

const initialValues = {
  username: "",
  password: "",
  company_name: "",
};

const userSchema = yup.object().shape({
  username: yup.string().required("required"),
  password: yup.string().required("required"),
  company_name: yup.string().required("required"),
});

// ... (your existing code)

const Form = ({
  setIsAuthenticated,
  setCompanyName,
  setInvType,
  setBranch,
  setUsername,
  userControl,
  setUserControl,
  url,
  v,
  setCompCity,
  setCompStreet,
  setCompPhone, setAccNo,
  activeField, setActiveField, showKeyboard, setShowKeyboard, setCompTime, setBranchDes, setAllowRecall
}) => {
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [logMess, setLogMess] = useState("");
  const [portal, setPortal] = useState(Cookies.get('portal') || "");
  const [dbHost, setDbHost] = useState(Cookies.get('dbHost') || "");
  const [adminPassword, setAdminPassword] = useState("");
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [showPortalDBForm, setShowPortalDBForm] = useState(false);


  const navigate = useNavigate();

  const handlePortalDBSubmit = () => {
    // Save Portal and DB Host to cookies
    Cookies.set('portal', portal, { expires: 365 });
    Cookies.set('dbHost', dbHost, { expires: 365 });
    setShowPortalDBForm(false); // Hide the portal/db host form after submission
  };

  const handlePasswordSubmit = () => {
    // Check admin password
    if (adminPassword === "admin123") { // Replace this with actual password logic
      setShowPasswordInput(false); // Hide password input
      setShowPortalDBForm(true);  // Show the portal/db host form for editing
      setAdminPassword(""); // Clear the password input field
    } else {
      alert("Incorrect password");
    }
  };
  const formikRef = useRef(null);

  const handleKeyPress = (input) => {
    const formik = formikRef.current;
    if (formik && activeField) {
      formik.setFieldValue(activeField, formik.values[activeField] + input);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      // Clear the company name from local storage
      //clearCompanyName();
      const response = await fetch(`${url}/pos/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          password: values.password,
          company_name: values.company_name,
        }),
      });

      if (response.ok) {
        const responseUser = await response.json();
        if (responseUser.message === "Invalid Credentials") {
          setLogMess(responseUser.message);
          
        } else {
          localStorage.setItem("company_name", values.company_name);
          await setCompanyName(localStorage.getItem("company_name"));

          localStorage.setItem("user_branch", responseUser.user["Code"]);
          await setBranch(localStorage.getItem("user_branch"));

          localStorage.setItem("branch_description", responseUser.user["Description"]);
          await setBranchDes(localStorage.getItem("branch_description"));

          localStorage.setItem("user_invType", responseUser.user["SAType"]);
          await setInvType(localStorage.getItem("user_invType"));

          localStorage.setItem("user_recall", responseUser.user["RecallInv"]);
          await setAllowRecall(localStorage.getItem("user_recall"));

          localStorage.setItem("comp_phone", responseUser.comp["Phone"]);
          await setCompPhone(localStorage.getItem("comp_phone"));
          
          localStorage.setItem("comp_city", responseUser.comp["City"]);
          await setCompCity(localStorage.getItem("comp_city"));

          localStorage.setItem("comp_street", responseUser.comp["Street"]);
          await setCompStreet(localStorage.getItem("comp_street"));

          localStorage.setItem("acc_no", responseUser.accno);
          await setAccNo(localStorage.getItem("acc_no"));
          localStorage.setItem("FromDate", responseUser.FromDate);  // Store beginning year
          localStorage.setItem("ToDate", responseUser.ToDate);
          localStorage.setItem("is_within_year", responseUser.is_within_year);
          localStorage.setItem("user_pos", responseUser.user["Pos"]);
          localStorage.setItem("user_manage_items", responseUser.user["ManageItems"]);
          localStorage.setItem("user_manage_group_items", responseUser.user["ManageGrpItems"]);
          localStorage.setItem("user_inv_history", responseUser.user["InvHistory"]);
          localStorage.setItem("user_daily_sales", responseUser.user["DailySales"]);
          localStorage.setItem("user_cash_on_hands", responseUser.user["CashOnHands"]);


          sessionStorage.setItem("isAuthenticated", "true");
          await setIsAuthenticated(sessionStorage.getItem("isAuthenticated"));
          //updateCompanyName(values.company_name);
          localStorage.setItem("username", responseUser.user["username"]);
          await setUsername(localStorage.getItem("username"));
          localStorage.setItem(
            "user_control",
            responseUser.user["user_control"]
          );
          const s = setUserControl(localStorage.getItem("user_control"));
          localStorage.setItem("comp_time", responseUser.comp["EndTime"]);
          await setCompTime(localStorage.getItem("comp_time"));
          setLogMess(responseUser.message);
          // navigate(`/${v}/PoS`);
          navigate(`/${v}/welcome`);
        }
        setTimeout(() => {
          setLogMess("");
        }, 3000);
      } else {
        // Handle authentication error
        console.error("Authentication failed");
      }
    } catch (error) {
      console.error("Error during authentication", error);
    }
  };


  return (
    <Grid container justifyContent="center" alignItems="center" height="100vh">
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper
          elevation={3}
          sx={{
            padding: 3,
            textAlign: "center",
            background: colors.primary[500],
          }}
        >
          <Typography variant="h5" mb={3}>
            Login
          </Typography>
          <Typography
            color="error"
            style={{
              fontSize: "1.1rem",
              fontWeight: "bold",
              textAlign: "center",
              marginBottom: "1rem", // Add margin bottom for spacing
              height: "10px",
            }}
          >
            {logMess}
          </Typography>
          <Formik
            innerRef={formikRef}
            onSubmit={handleFormSubmit}
            initialValues={initialValues}
            validationSchema={userSchema}
          >
            {({
              values,
              errors,
              touched,
              handleBlur,
              handleChange,
              handleSubmit,
            }) => (
              <form onSubmit={handleSubmit}>
                <Grid container spacing={4}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="filled"
                      type="text"
                      label="Username"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.username}
                      name="username"
                      error={!!touched.username && !!errors.username}
                      helperText={
                        touched.username && errors.username ? (
                          <span style={{ fontSize: "0.9rem" }}>
                            {errors.username}
                          </span>
                        ) : null
                      }
                      sx={{ height: "64px" }}
                      onFocus={() => {
                        setActiveField("username");
                      }}
                      InputLabelProps={{ style: { fontSize: "1.2rem" } }}
                      InputProps={{ style: { fontSize: "1.2rem" } }}
                      onDoubleClick={() => {
                        setShowKeyboard(true);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="filled"
                      type="password"
                      label="Password"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.password}
                      name="password"
                      error={!!touched.password && !!errors.password}
                      helperText={
                        touched.username && errors.username ? (
                          <span style={{ fontSize: "0.9rem" }}>
                            {errors.username}
                          </span>
                        ) : null
                      }
                      sx={{ height: "64px" }}
                      onFocus={() => {
                        setActiveField("password");
                      }}
                      InputLabelProps={{ style: { fontSize: "1.2rem" } }}
                      InputProps={{ style: { fontSize: "1.2rem" } }}
                      onDoubleClick={() => {
                        setShowKeyboard(true);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="filled"
                      type="text"
                      label="Company"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      value={values.company_name}
                      name="company_name"
                      error={!!touched.company_name && !!errors.company_name}
                      helperText={
                        touched.username && errors.username ? (
                          <span style={{ fontSize: "0.9rem" }}>
                            {errors.username}
                          </span>
                        ) : null
                      }
                      sx={{ height: "64px" }}
                      onFocus={() => {
                        console.log("Active field set to: company");
                        setActiveField("company_name");
                      }}
                      InputLabelProps={{ style: { fontSize: "1.2rem" } }}
                      InputProps={{ style: { fontSize: "1.2rem" } }}
                      onDoubleClick={() => {
                        setShowKeyboard(true);
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      fullWidth
                      style={{
                        backgroundColor: colors.greenAccent[500],
                        fontSize: "1.2rem",
                      }}
                    >
                      Login
                    </Button>
                  </Grid>
                </Grid>
              </form>
            )}
          </Formik>
        </Paper>
      </Grid>
      {showKeyboard && (
        <Box
          sx={{
            width: "80%",
            position: "absolute",
            top: "50%", // Adjust as needed to position the keyboard vertically
            left: "50%", // Adjust as needed to position the keyboard horizontally
            transform: "translate(-50%, -50%)", // Center the keyboard
            zIndex: 9999,
          }}
        >
          <Keyboard
            onKeyPress={handleKeyPress}
            setShowKeyboard={setShowKeyboard}
            showKeyboard={showKeyboard}
            activeField={activeField}
          />
        </Box>
      )}
      <IconButton
        sx={{
          position: "absolute",
          top: "20px",
          right: "20px",
          width: "200px",
          height: "100px",
          borderRadius: 0,
          //backgroundColor: "#fff", // Background color for the button
          // boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Box shadow for a raised effect
        }}
        onClick={() => setShowKeyboard(!showKeyboard)}
      >
        <img
          src={`${process.env.PUBLIC_URL}/imkey13.png`}
          alt="Keyboard Image"
          style={{ width: "100%", height: "100%" }}
        />
        {/* Adjust icon size and color */}
      </IconButton>
      <Grid container justifyContent="center" alignItems="center" height="100vh">
  <Grid item xs={12} sm={8} md={6} lg={4}>
    <Paper elevation={3} sx={{ padding: 3, textAlign: "center" }}>
      {!showPasswordInput && !portal && !dbHost ? (
        // Show the form to enter portal and dbHost if cookies are not set
        <>
          <Typography variant="h5" mb={3}>
            Enter Portal and Database Host
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Portal URL"
            value={portal}
            onChange={(e) => setPortal(e.target.value)}
            sx={{ height: "64px", marginBottom: "1rem" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Database Host"
            value={dbHost}
            onChange={(e) => setDbHost(e.target.value)}
            sx={{ height: "64px", marginBottom: "1rem" }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handlePortalDBSubmit}
          >
            Save
          </Button>
        </>
      ) : portal && dbHost && !showPasswordInput ? (
        // Show saved values as text and allow updating after entering the password
        <>
          <Typography variant="h5" mb={3}>
            Portal and Database Host
          </Typography>
          <Typography variant="body1" mb={3}>
            Portal URL: {portal}
          </Typography>
          <Typography variant="body1" mb={3}>
            Database Host: {dbHost}
          </Typography>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => setShowPasswordInput(true)}
          >
            Update
          </Button>
        </>
      ) : (
        // Show the password input field for updating values
        <>
          <Typography variant="h5" mb={3}>
            Enter Admin Password to Update
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            type="password"
            label="Admin Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            sx={{ height: "64px", marginBottom: "1rem" }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handlePasswordSubmit}
          >
            Submit
          </Button>
        </>
      )}

      {/* Show the portal/db host input form again after password verification */}
      {showPasswordInput && adminPassword === "admin123" && (
        <>
          <Typography variant="h5" mb={3}>
            Update Portal and Database Host
          </Typography>
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Portal URL"
            value={portal}
            onChange={(e) => setPortal(e.target.value)}
            sx={{ height: "64px", marginBottom: "1rem" }}
          />
          <TextField
            fullWidth
            variant="filled"
            type="text"
            label="Database Host"
            value={dbHost}
            onChange={(e) => setDbHost(e.target.value)}
            sx={{ height: "64px", marginBottom: "1rem" }}
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handlePortalDBSubmit}
          >
            Update
          </Button>
        </>
      )}
    </Paper>
  </Grid>
</Grid>



    </Grid>
  );
};

export default Form;

