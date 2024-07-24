import { executeSQLQuery } from "../../database";

const formatDateString = (date:any) => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const getBooking = async (bookingId: string) => {
    let query;
    if (bookingId ===undefined) { query = `SELECT * FROM public."bookingTable"`;}else {
        query = `SELECT * FROM public."bookingTable" where id = '${bookingId}'`; 
    }
	const result = await executeSQLQuery(query);
	return result.rows;
};

export const addBooking = async (firstName:string,  lastName:string,  nationality:string,  jobType:string,  phone:number,  seekedSalary:number,  email:string,  description:string,  bookingDate:Date) => {
    const formattedDate = formatDateString(new Date(bookingDate));
    const query = `INSERT INTO public."bookingTable"("firstName",  "lastName",  "nationality",  "jobType",  phone,  "seekedSalary",  email,  description,  "bookingDate") VALUES ('${firstName}', '${lastName}', '${nationality}', '${jobType}', ${phone}, ${seekedSalary}, '${email}', '${description}', '${formattedDate}') RETURNING *`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};

export const updateBooking = async (bookingId: string, updateFields: { [key: string]: any }) => {
    const setString = Object.keys(updateFields).map((key, index) => `"${key}" = $${index + 2}`).join(', ');
    const values = [bookingId, ...Object.values(updateFields)];
    
    const query = `UPDATE public."bookingTable" SET ${setString} WHERE id = $1 RETURNING *`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};


export const deleteBooking = async (bookingId: string) => {
    const query = `DELETE  FROM public.postgres WHERE id='${bookingId}' returning id`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};