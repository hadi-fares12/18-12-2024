import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";

const POSOptions = ({ url, companyName }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [printerOptions, setPrinterOptions] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState("");
  const [selectedReport, setSelectedReport] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const reportOptions = ["Report 1", "Report 2", "Report 3"];

  // Fetch printers and current settings on component mount
  useEffect(() => {
    const fetchPrinters = async () => {
      setLoading(true);
      try {
        // Fetch printers list
        const printerResponse = await fetch(`${url}/pos/getPrinters`);
        if (!printerResponse.ok) {
          const errorText = await printerResponse.text();
          console.error("Failed to fetch printers:", errorText);
          setErrorMessage("Failed to fetch printer options.");
          return;
        }
        const printerData = await printerResponse.json();
        setPrinterOptions(Array.isArray(printerData.printers) ? printerData.printers : []);
        
        // Fetch current printer settings
        const settingsResponse = await fetch(`${url}/pos/getInvoicePrinterSettings/${companyName}`);
        if (!settingsResponse.ok) {
          const errorText = await settingsResponse.text();
          console.error("Failed to fetch settings:", errorText);
          setErrorMessage("Failed to fetch current settings.");
          return;
        }
        const settingsData = await settingsResponse.json();
        setSelectedPrinter(settingsData.printerName || "");
        setSelectedReport(settingsData.reportName || "");
      } catch (error) {
        console.error("Error fetching data:", error);
        setErrorMessage("An error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrinters();
  }, [url, companyName]);

  // Handle save functionality
  const handleSave = async () => {
    if (!selectedPrinter || !selectedReport) {
      setErrorMessage("Please select both a printer and a report.");
      return;
    }
  
    try {
      const response = await fetch(`${url}/pos/updateinvoiceprinters/${companyName}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            PrinterName: selectedPrinter,
            ReportName: selectedReport,
            OldPrinterName: selectedPrinter, // Modify this if necessary to track old printer
          },
        ]),
      });
  
      if (response.ok) {
        const result = await response.json();
        setSuccessMessage(result.message || "Settings saved successfully!");
        setErrorMessage(""); // Clear error message
      } else {
        const errorText = await response.text();
        console.error("Error saving settings:", errorText);
        setErrorMessage("Failed to save settings. Please try again.");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setErrorMessage("An error occurred while saving settings.");
    }
  };

  if (loading) {
    return <Typography>Loading printer options...</Typography>;
  }

  return (
    <div>welocme</div>
    // <Box sx={{ padding: "20px" }}>
    //   <Typography variant="h5" gutterBottom>
    //     Printer-Invoice Options
    //   </Typography>

    //   {/* Printer Selection */}
    //   <Box sx={{ marginBottom: "20px" }}>
    //     <Select
    //       value={selectedPrinter}
    //       onChange={(e) => setSelectedPrinter(e.target.value)}
    //       fullWidth
    //       variant="outlined"
    //       size="small"
    //     >
    //       {printerOptions.length > 0 ? (
    //         printerOptions.map((printer, index) => (
    //           <MenuItem key={index} value={printer}>
    //             {printer}
    //           </MenuItem>
    //         ))
    //       ) : (
    //         <MenuItem disabled>No printers available</MenuItem>
    //       )}
    //     </Select>
    //   </Box>

    //   {/* Report Selection */}
    //   <Box sx={{ marginBottom: "20px" }}>
    //     <Select
    //       value={selectedReport}
    //       onChange={(e) => setSelectedReport(e.target.value)}
    //       fullWidth
    //       variant="outlined"
    //       size="small"
    //     >
    //       {reportOptions.map((report, index) => (
    //         <MenuItem key={index} value={report}>
    //           {report}
    //         </MenuItem>
    //       ))}
    //     </Select>
    //   </Box>

    //   {/* Save Button */}
    //   <Button variant="contained" color="primary" onClick={handleSave} fullWidth>
    //     Save
    //   </Button>

    //   {/* Success Message */}
    //   {successMessage && (
    //     <Typography
    //       variant="body1"
    //       style={{ color: colors.greenAccent[500], marginTop: "20px" }}
    //     >
    //       {successMessage}
    //     </Typography>
    //   )}

    //   {/* Error Message */}
    //   {errorMessage && (
    //     <Typography
    //       variant="body1"
    //       style={{ color: colors.redAccent[500], marginTop: "20px" }}
    //     >
    //       {errorMessage}
    //     </Typography>
    //   )}
    // </Box>
  );
};

export default POSOptions;
