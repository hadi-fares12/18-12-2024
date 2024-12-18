import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import TableContainer from "@mui/material/TableContainer";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { handleSave } from "./SaveHandler.jsx";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import { textAlign } from "@mui/system";
import Checkbox from "@mui/material/Checkbox";
import { setIn } from "formik";
import { useLanguage } from "../LanguageContext.js";
import translations from "../translations.js";
import EditIcon from "@mui/icons-material/Edit"; 
import ListIcon from "@mui/icons-material/List";
import ClearIcon from '@mui/icons-material/Clear';
const ItemDetails = ({
  itemDetails,
  setItemDetails,
  items,
  setItems,
  companyName,
  checkUnsavedChanges,
  successMessage,
  setSuccessMessage,
  itemDetailsCopy,
  setItemDetailsCopy,
  setOldItemNo,
  setNewItemNo,
  unsavedChanges,
  setUnsavedChanges,
  url,
  activeField,
  setActiveField,
  showKeyboard,
  setShowKeyboard,valMessage, setValMessage, inputValue,
        setInputValue,
        tickKey,
        setTickKey
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { language } = useLanguage();
  const t = translations[language];
  const [isEditingItemNo, setIsEditingItemNo] = useState(false);
  const [BarCodeUpdate, setBarCodeUpdate] = useState("N");

  const [groupNames, setGroupNames] = useState([]);
  const [err, setErr] = useState("");
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [selectedGroupName, setSelectedGroupName] = useState(
    itemDetails.GroupName
  );
  const [selectedGroup, setSelectedGroup] = useState({
    GroupNo: itemDetails.GroupNo,
    GroupName: itemDetails.GroupName,
  });
  // Inside your ItemDetails component
const [ktList, setKtList] = useState([]); // State for KT printers list
const [ktListOpen, setKtListOpen] = useState(false); // State for dropdown visibility
const [ktField, setKtField] = useState(null); // State to track the current KT field

useEffect(() => {
  const fetchKtList = async () => {
    try {
      const response = await fetch(`${url}/pos/kitchen/${companyName}`);
      if (!response.ok) throw new Error("Error fetching KT printers list");
      const data = await response.json();
      setKtList(data); // Set the KT list in state
    } catch (error) {
      console.error(error);
    }
  };

  fetchKtList();
}, [companyName]);

  const handleValueUpdate = (field, updatedValue) => {
    if (
      field === "Tax" ||
      field === "UPrice" ||
      field === "UPrice1" ||
      field === "UPrice2" ||
      field === "UPrice3" ||
      field === "UPrice4" ||
      field === "UPrice5" ||
      field === "UPrice6" ||
      field === "Disc" ||
      field === "Srv"
    ) {
      // Validate if the value is a number
      if (isNaN(updatedValue)) {
        setErr(`${field} ${t["errorMessage"]["number"]}`);
         setInputValue("");
         setTickKey(false);
        return;
      }
    } else if (
      field === "KT1" ||
      field === "KT2" ||
      field === "KT3" ||
      field === "KT4"
    ) {
      // Validate if the value has more than 2 characters
      if (updatedValue.length > 2) {
        setErr(`${field} ${t["errorMessage"]["maxLength"]}`);
        setInputValue("");
        setTickKey(false);
        return;
      }
    }
    setErr(""); // Clear validation message if no error
    if (field === "ItemNo" && !isEditingItemNo) {
      setErr(`${t["editItemNoMessage"]}`);
      return;
    }
    if (field === "GroupName") {
      // For Select component
      setItemDetailsCopy((prev) => ({
        ...prev,
        GroupName: updatedValue.GroupName,
        GroupNo: updatedValue.GroupNo,
      }));
      setSelectedGroupName(updatedValue.GroupName);
      setSelectedGroup(updatedValue); // Also update the selected group object
    } else if (field === "Image") {
      const file = updatedValue.target.files[0];

      // Read the file as base64 and set it in the state
      const reader = new FileReader();
      reader.onload = () => {
        setItemDetailsCopy((prev) => ({
          ...prev,
          [field]: {
            name: file.name,
            by: reader.result.split(",")[1], // Extracting base64 data
          },
          GroupNo: selectedGroup?.GroupNo || "",
        }));
      };
      reader.readAsDataURL(file);
    } else {
      // For TextField and other fields
      setItemDetailsCopy((prev) => ({
        ...prev,
        [field]: updatedValue,
        GroupNo: selectedGroup?.GroupNo || "", // Set the GroupNo from the selectedGroup
      }));
   
    }
        //setInputValue("");
        //setTickKey(false);
  };

  useEffect(() => {
    if (tickKey) {
        handleValueUpdate(activeField, inputValue);
    }
  }, [tickKey]);

  useEffect(() => {
    if (JSON.stringify(itemDetailsCopy) !== JSON.stringify(itemDetails)) {
      setUnsavedChanges(true);
    } else {
      setUnsavedChanges(false);
    }
  }, [itemDetailsCopy, itemDetails, unsavedChanges]);

  useEffect(() => {
    // Fetch groupItems when the component mounts
    
    const fetchGroupItems = async () => {
      try {
        const response = await fetch(
          `${url}/pos/groupitems/${companyName}`
        );
        if (!response.ok) {
          throw new Error("Error fetching groupItems");
        }
        const data = await response.json();
        setGroupNames([...data]); // Assuming data is an array of objects with groupName and groupNo
      } catch (error) {
        console.error(error);
      }
    };

    fetchGroupItems();
  }, []);
  useEffect(() => {
    const fetchBarcodePermission = async () => {
      try {
        const checkResponse = await fetch(`${url}/pos/checkBarcodeUpdatePermission/${companyName}/${username}`);
        if (!checkResponse.ok) {
          throw new Error("Network response was not ok");
        }
        const permissionData = await checkResponse.json();
        setBarCodeUpdate(permissionData.BarCodeUpdate); // Set the permission state
      } catch (error) {
        console.error("Error fetching barcode update permission:", error);
      }
    };
  
    fetchBarcodePermission();
  }, [companyName, username]);
  

  useEffect(() => {
    if (err) {
      const timeout = setTimeout(() => {
        setErr("");
      }, 2000); // Adjust the duration as needed (in milliseconds)
      return () => clearTimeout(timeout);
    }
  }, [err]);

  // Trigger handleSave when userDetailsCopy changes
  // useEffect(() => {
  //   handleSave();
  // }, [userDetailsCopy]);

  const rows = Object.entries(itemDetailsCopy)
    .filter(([key]) => key !== "GroupNo")
    .map(([key, value], index) => (
      <TableRow
        key={key}
        style={{
          display: "flex",
          flexDirection: "row",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      >
        <TableCell
          style={{
            //minWidth: "80px",
            width: "30%",
            height: "100%",
            whiteSpace: "pre-wrap", // Allow text wrapping
            overflowWrap: "normal", // Do not break words
            //overflowWrap: "break-word",
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              maxHeight: "100%",
              width: "100%",
              alignItems: "start", // Align text to the start (left)
              justifyContent: "center",
            }}
          >
            <Typography variant="h4">{t[key] || key}</Typography>
          </Box>
        </TableCell>

        <TableCell
          style={{
            width: "70%",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              width: "100%",
            }}
          >
           {key === "ItemName" || key === "Ingredients" ? (
  <TextField
    value={value}
    onChange={(e) => handleValueUpdate(key, e.target.value)}
    fullWidth
    size="small"
    variant="outlined"
    onDoubleClick={() => {
      setInputValue("");
      setTickKey(false);
      setShowKeyboard(true);
    }}
    onFocus={() => {
      setActiveField(key);
    }}
  />
      ) : key === "ShowOnMenu" || key === "ShowOnbarc"  ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-around",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={value === "Y"}
              onChange={() =>
                handleValueUpdate(key, value === "Y" ? "N" : "Y")
              }
            />
            <Typography variant="h4">Y</Typography>
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <Checkbox
              checked={value === "N"}
              onChange={() =>
                handleValueUpdate(key, value === "N" ? "Y" : "N")
              }
            />
            <Typography variant="h4">N</Typography>
          </div>
        </div>
) : key === "UPrice" || key === "UPrice1" || key === "UPrice2" || key === "UPrice3" || key === "UPrice4" || key === "UPrice5" || key === "UPrice6" || key === "Disc" || key === "Tax"  ? (
  <TextField
    value={value}
    onChange={(e) => handleValueUpdate(key, e.target.value)}
    fullWidth
    size="small"
    variant="outlined"
    inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
    onDoubleClick={() => {
      setInputValue("");
      setTickKey(false);
      setShowKeyboard(true);
    }}
    onFocus={() => {
      setActiveField(key);
    }}
  />
) : key === "KT1" || key === "KT2" || key === "KT3" || key === "KT4" ? (
  <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
  <TextField
    value={value}
    onChange={(e) => handleValueUpdate(key, e.target.value)}
    fullWidth
    size="small"
    variant="outlined"
    inputProps={{ readOnly: true }} // Make TextField read-only
    onFocus={() => setActiveField(key)}
  />
  <ClearIcon
    onClick={() => handleValueUpdate(key, "")} // Clear data when clicked
    style={{ cursor: "pointer", marginLeft: "8px" }}
  />
  <ListIcon
    onClick={() => {
      setKtField(key); // Set the current KT field
      setKtListOpen(!ktListOpen); // Toggle KT list dropdown
    }}
    style={{ cursor: "pointer", marginLeft: "8px" }}
  />
  {ktListOpen && ktField === key && (
    <Box
      sx={{
        position: "absolute",
        top: "100%",
        backgroundColor: "white",
        border: "1px solid #ddd",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
        zIndex: 1000,
        width: "200px",
        maxHeight: "150px",
        overflowY: "auto",
      }}
    >
      {ktList.map((kt) => (
        <MenuItem
          key={kt.KT}
          onClick={() => {
            handleValueUpdate(ktField, kt.KT);
            setKtListOpen(false); // Close dropdown
          }}
        >
          Kitchen- {kt.KT}
        </MenuItem>
      ))}
    </Box>
  )}
</div>
) : key === "ItemNo" ? (
  <div style={{ display: "flex", alignItems: "center" }}>
              <TextField
                value={value}
                onChange={(e) => handleValueUpdate(key, e.target.value)}
                fullWidth
                size="small"
                variant="outlined"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  disabled: !isEditingItemNo,
                }}
                sx={{
                  backgroundColor: !isEditingItemNo ? "rgba(224, 224, 224, 1)" : "white", // Grey background when disabled
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: !isEditingItemNo ? "rgba(224, 224, 224, 1)" : undefined, // Grey border when disabled
                    },
                  },
                }}
                  onDoubleClick={() => {
                            setTickKey(false);

                  setInputValue("");
                  setShowKeyboard(true);
                }}
                onFocus={() => {
                  setActiveField(key);
                }}
              />
               {BarCodeUpdate === "Y" && (
               <EditIcon
                  sx={{ cursor: "pointer", ml: 1 }}
                  onClick={() => setIsEditingItemNo(!isEditingItemNo)}
                />
               )}
              </div>
            ) : key === "Active" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={value === "Y"}
                    onChange={() =>
                      handleValueUpdate(key, value === "Y" ? "N" : "Y")
                    }
                  />
                  <Typography variant="h4">Y</Typography>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={value === "N"}
                    onChange={() =>
                      handleValueUpdate(key, value === "N" ? "Y" : "N")
                    }
                  />
                  <Typography variant="h4">N</Typography>
                </div>
              </div>
            ) : key === "Image" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                }}
              >
                <input
                  type="file"
                  accept=".jpg, .jpeg, .png"
                  onChange={(e) => handleValueUpdate(key, e)}
                  id="inputFile"
                />
                {value && typeof value === "string" && (
                  <Typography variant="h4">{value}</Typography>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-around",
                  height: "100%",
                }}
              >
                <Select
                  sx={{ width: "100%", height: "100%", textAlign: "center" }}
                  value={selectedGroupName}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setSelectedGroupName(selectedValue);
                    const selectedGroupObject = groupNames.find(
                      (item) => item.GroupName === selectedValue
                    );
                    setSelectedGroup(selectedGroupObject);
                    handleValueUpdate(key, selectedGroupObject);
                  }}
                >
                  {groupNames !== undefined &&
                    groupNames.map((item) => (
                      <MenuItem key={item.GroupNo} value={item.GroupName}>
                        {item.GroupName}
                      </MenuItem>
                    ))}
                </Select>
              </div>
            )}
          </div>
        </TableCell>
      </TableRow>
    ));

  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      height: "100%",
      padding: "16px",
      "@media (max-width:600px)": {
        padding: "8px",
      },
    }}>
      <style>
        {`
          #file-input {
            display: none;
          }
        `}
      </style>
      <TableContainer sx={{ flexGrow: 1, overflowY: "auto" }}>
        <Table>
          <TableBody
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)", // Adjust the number of columns
              gap: "5px",
            }}
          >
            {rows}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        {err && (
          <Typography
            variant="h1"
            color="error"
            style={{
              fontWeight: "bold",
            }}
          >
            {err}
          </Typography>
        )}
      </Box>
      <Box
        sx={{
          minHeight: "10%",
          width: "100%",
          justifyContent: "space-between",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {successMessage && (
          <Box sx={{ width: "95%", marginTop: "auto" }}>
            <Typography variant="h3" style={{ color: colors.greenAccent[500] }}>
              {successMessage}
            </Typography>
          </Box>
        )}
        {unsavedChanges && (
          <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
            <Button
              variant="contained"
              color="secondary"
              style={{
                //background: colors.greenAccent[600],
                fontSize: "1.1rem",
              }}
              onClick={() =>
                handleSave(
                  companyName,
                  itemDetails,
                  itemDetailsCopy,
                  setSuccessMessage,
                  setItemDetails,
                  setOldItemNo,
                  setNewItemNo,
                  url,
                )
              }
            >
              {t["save"]}
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ItemDetails;
