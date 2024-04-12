import axios from "axios";
import multer from "multer";

const API_BASE_URL = "https://api.smartsheet.com/2.0";
const smartsheet = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.SMARTSHEET_API_TOKEN}`,
  },
});

// Configure multer to handle file uploads
const upload = multer({
  storage: multer.memoryStorage(), // Store files in memory
});

export const config = {
  api: {
    bodyParser: false, // Disable bodyParser to allow custom body parsing
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }
  let fileResponse;

  try {
    // Parse form data with multer middleware
    upload.single("file")(req, res, async (err) => {
      if (err) {
        console.error("Error parsing file:", err);
        return res.status(400).json({ error: "Error parsing file" });
      }

      const formData = req.body;
      const sheetId = process.env.SMARTSHEET_SHEET_ID;

      // Mapping between form fields and Smartsheet column titles
      const columnMapping = {
        UserName: "First and Last Name",
        State: "State",
        Email: "Email Address",
        Description: "Description",
        Grant: "Type of Grant",
        PRaward: "PR Award #",
      };

      // Extract column IDs dynamically based on column titles
      const columnIdsPromises = Object.entries(columnMapping).map(
        async ([fieldName, columnTitle]) => {
          const response = await smartsheet.get(
            `/sheets/${sheetId}/columns?title=${encodeURIComponent(
              columnTitle
            )}`
          );
          const columns = response.data.data;
          const column = columns.find((column) => column.title === columnTitle);
          return { columnId: column.id, value: formData[fieldName] };
        }
      );
      const columnIds = await Promise.all(columnIdsPromises);

      const response = await smartsheet.post(`/sheets/${sheetId}/rows`, {
        toTop: true,
        cells: columnIds,
      });

      const newRowId = response.data.result.id;

      if (req.file) {
        // Create a FormData object to send the file
        const formDataWithFile = new FormData();
        const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
        formDataWithFile.append("file", blob, req.file.originalname);

        // Set the headers manually
        const headers = {
          "Content-Type": "application/octet-stream",
          Authorization: `Bearer ${process.env.SMARTSHEET_API_TOKEN}`,
        };

        // Upload the file and get the attachment ID
        fileResponse = await axios.post(
          `${API_BASE_URL}/sheets/${sheetId}/rows/${newRowId}/attachments`,
          formDataWithFile,
          {
            headers: headers,
          }
        );

        return res.status(200).json(fileResponse.data);
      } else {
        return res.status(200).json(response.data);
      }
    });
  } catch (error) {
    console.error("Error submitting form data to Smartsheet:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
