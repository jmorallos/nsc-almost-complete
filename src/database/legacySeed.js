/** Legacy flat employee records from the original in-memory store (preserved for UI continuity). */
export const legacyEmployees = [
    {
        fname: 'Maria', lname: 'Santos', email: 'm.santos@college.edu.ph', contact: '09171234567',
        address: '123 Rizal St, Manila', position: 'Dean', dept: 'College of Arts', status: 'Active',
        start_date: '2018-06-01', picture: null,
        docs: [
            { name: 'Employment Contract.pdf', type: 'pdf', size: '1.2 MB', date: '2018-06-01', source: 'upload' },
            { name: 'Personal Data Sheet (CS Form 212).pdf', type: 'pdf', size: '890 KB', date: '2018-06-01', source: 'upload' },
            { name: 'SCANNED - CSC Eligibility.pdf', type: 'scan', size: '1.8 MB', date: '2024-01-10', source: 'scan' },
        ],
    },
    {
        fname: 'Jose', lname: 'Reyes', email: 'j.reyes@college.edu.ph', contact: '09281234567',
        address: '456 Mabini Ave, Quezon City', position: 'Professor II', dept: 'College of Engineering',
        status: 'Active', start_date: '2015-08-15', picture: null,
        docs: [
            { name: 'Employment Contract.pdf', type: 'pdf', size: '1.1 MB', date: '2015-08-15', source: 'upload' },
            { name: 'Board Certificate.pdf', type: 'pdf', size: '750 KB', date: '2015-08-15', source: 'upload' },
        ],
    },
    {
        fname: 'Ana', lname: 'Cruz', email: 'a.cruz@college.edu.ph', contact: '09391234567',
        address: '789 Bonifacio Rd, Makati City', position: 'Administrative Officer', dept: 'Administration',
        status: 'On Leave', start_date: '2020-01-10', picture: null,
        docs: [
            { name: 'Employment Contract.pdf', type: 'pdf', size: '1.0 MB', date: '2020-01-10', source: 'upload' },
            { name: 'Leave Application Form.pdf', type: 'pdf', size: '300 KB', date: '2024-03-01', source: 'upload' },
        ],
    },
    {
        fname: 'Pedro', lname: 'Bautista', email: 'p.bautista@college.edu.ph', contact: '09501234567',
        address: '321 Luna St, Pasig City', position: 'University Registrar', dept: 'Administration',
        status: 'Active', start_date: '2019-03-22', picture: null,
        docs: [
            { name: 'Employment Contract.pdf', type: 'pdf', size: '1.2 MB', date: '2019-03-22', source: 'upload' },
            { name: 'Appointment Paper.pdf', type: 'pdf', size: '600 KB', date: '2019-03-22', source: 'upload' },
        ],
    },
    {
        fname: 'Liza', lname: 'Villanueva', email: 'l.villanueva@college.edu.ph', contact: '09611234567',
        address: '654 Del Pilar, Mandaluyong', position: 'Chief Librarian', dept: 'Library Services',
        status: 'Active', start_date: '2017-07-05', picture: null,
        docs: [{ name: 'Employment Contract.pdf', type: 'pdf', size: '900 KB', date: '2017-07-05', source: 'upload' }],
    },
    {
        fname: 'Ramon', lname: 'Dela Cruz', email: 'r.delacruz@college.edu.ph', contact: '09721234567',
        address: '88 Gen. Luna St, Cebu City', position: 'Professor I', dept: 'College of Nursing',
        status: 'Active', start_date: '2021-06-14', picture: null, docs: [],
    },
    {
        fname: 'Carla', lname: 'Mendoza', email: 'c.mendoza@college.edu.ph', contact: '09831234567',
        address: '11 Colon St, Cebu City', position: 'Assistant Professor', dept: 'College of Education',
        status: 'Inactive', start_date: '2016-11-01', picture: null, docs: [],
    },
];

export const legacyDepartments = [
    { name: 'Administration', description: 'Administrative and support services' },
    { name: 'College of Arts', description: 'Humanities and social sciences' },
    { name: 'College of Education', description: 'Teacher training and education' },
    { name: 'College of Engineering', description: 'Technical and engineering programs' },
    { name: 'College of Nursing', description: 'Nursing and health sciences' },
    { name: 'Library Services', description: 'Library and information management' },
];

export const legacyUsers = [
    { name: 'Admin', username: 'admin', password: 'admin123', role: 'HR Administrator' },
    { name: 'HR Staff', username: 'hrstaff', password: 'staff123', role: 'HR Staff' },
];
