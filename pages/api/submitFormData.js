import axios from 'axios';

const API_BASE_URL = 'https://api.smartsheet.com/2.0';

const smartsheet = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.SMARTSHEET_API_TOKEN}`,
  },
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const formData = req.body;
    const sheetId = process.env.SMARTSHEET_SHEET_ID;


     // Mapping between form fields and Smartsheet column titles
     const columnMapping = {
      UserName: 'First and Last Name',
      State: 'State',
      Email: 'Email Address',
      Description: 'Description',
      Grant: 'Type of Grant',
      PRaward: 'PR Award #',
    };

    // Extract column IDs dynamically based on column titles
    const columnIdsPromises = Object.entries(columnMapping).map(async ([fieldName, columnTitle]) => {
      const response = await smartsheet.get(`/sheets/${sheetId}/columns?title=${encodeURIComponent(columnTitle)}`);
      const columns = response.data.data;
      const column = columns.find(column => column.title === columnTitle);
      return { columnId: column.id, value: formData[fieldName] };
    });

    const columnIds = await Promise.all(columnIdsPromises);

    const response = await smartsheet.post(`/sheets/${sheetId}/rows`, {
      toTop: true,
      cells: columnIds,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error submitting form data to Smartsheet:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
