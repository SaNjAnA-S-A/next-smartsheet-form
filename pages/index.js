import { useState, useEffect } from 'react';

const Home = () => {
  const [formData, setFormData] = useState({
    UserName: '',
    State: '',
    Email: '',
    Description: '',
    Grant: '',
    PRaward: '',
  });


  const [dropdownOptions, setDropdownOptions] = useState([]);
  const [grantOptions, setGrantOptions] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch dropdown and grant options from Smartsheet when the component mounts
    fetch('/api/getDropdownOptions')
      .then(response => response.json())
      .then(data => {
        const dropdownValues = data.dropdownOptions.map(option => option.value);
        const grantValues = data.grantOptions.map(option => option.value);

        setDropdownOptions(dropdownValues);
        setGrantOptions(grantValues);

        console.log('Dropdown Options:', dropdownValues);
        console.log('Grant Options:', grantValues);
      })
      .catch(error => console.error('Error fetching options:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear the corresponding error when the user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/submitFormData', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log('Form data submitted successfully:', response.json());
      } else {
        console.error('Error submitting form data:', response.statusText);
      }
    } catch (error) {
      console.error('Error submitting form data:', error);
      alert("Unsuccessful Form Submission")
    }
    alert("Form Submitted Successfully!")
  };

  return (
    <div>
      <div className="max-w-2xl mx-auto bg-white p-16">
      <div className="container max-w-screen-lg mx-auto">
		<h1 className="text-2xl font-bold text-center mb-4 dark:text-gray-700">Technical Assistance Request Form</h1>
		<form onSubmit={handleSubmit}>
			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">First and Last Name</label>
				<input type="text" name="UserName" className="shadow-sm rounded-md w-full px-5 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={formData.UserName} onChange={handleInputChange} placeholder="Enter your first and last name" required/>
      </div>

			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">Email Address</label>
				<input type="email" name="Email" id="email" className="shadow-sm rounded-md w-full px-5 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={formData.Email} onChange={handleInputChange} placeholder="Enter your email address" required pattern= "[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$" />
			</div>

      <div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">Request Details:</label>
				<textarea
        className="shadow-sm rounded-md w-full px-5 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            name="Description"
            value={formData.Description}
            onChange={handleInputChange}
            rows="4" //adjust the number of rows as needed
            placeholder="Enter the request description"
          required></textarea>
			</div>

      <div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">State</label>
        <select name="State" className="shadow-sm rounded-md w-full px-5 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={formData.State} onChange={handleInputChange} 
        required>
        <option value="" disabled>Select state</option>
          {dropdownOptions.map((value, index) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}
          </select>
      </div>

      <div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">Type of Grant</label>
        <select name="Grant" className="shadow-sm rounded-md w-full px-5 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={formData.Grant} onChange={handleInputChange} required>
            <option value="" disabled>Select grant type</option>
          {grantOptions.map((value, index) => (
              <option key={index} value={value}>
                {value}
              </option>
            ))}
          </select></div>

      <div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-900 mb-2">PR Award #</label>
				<input type="text" name="PRaward" className="shadow-sm rounded-md w-full px-5 py-2 border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" value={formData.PRaward} onChange={handleInputChange} placeholder="Enter your PR Award number" required/>
			</div>
			<button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Submit</button>
		</form>
	</div>
</div>


    </div>
  );
};

export default Home;
