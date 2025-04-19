import { executeSQLQuery } from "../../database";


export const getBlog = async (blogId?: number) => {
    let query;
    if (!blogId) {
        query = 'SELECT * FROM public."blogTable";'; 
    } else {
        query = `SELECT * FROM public."blogTable" WHERE "blogId" = '${blogId}';`; 
    }
    const result = await executeSQLQuery(query);
    return result.rows; 
};
export const addBlog = async (
    blogAuthor: string,
    blogTitle: string,
    blogDate : string,
    blogContent  : string,
    blogImage : string | null) => { 
    const query = `INSERT INTO public."blogTable"("blogAuthor", "blogTitle", "blogDate" ,"blogContent"  ,"blogImage" )
     VALUES ('${blogAuthor}','${blogTitle}','${blogDate}','${blogContent}','${blogImage}')`;
    
     const result = await executeSQLQuery(query);
     return result.rows[0];
};

export const deleteBlog = async (blogId: number) => {
    const query = `DELETE  FROM public."blogTable" WHERE "blogId"='${blogId}' returning "blogId"`;
    const result = await executeSQLQuery(query);
    return result.rows[0];
};
export const updateBlog= async (
    blogId:BigInteger,
    blogAuthor: string,
    blogTitle: string,
    blogDate : string,
    blogContent  : string,
    blogImage : string | null
) => {
    const query = `UPDATE public."blogTable"
                   SET "blogAuthor"='${blogAuthor}', "blogTitle"='${blogTitle}', "blogDate"='${blogDate}',
                       "blogContent"='${blogContent}', "blogImage"='${blogImage}'
                   WHERE "blogId"='${blogId}' RETURNING *;`;
    
    const result = await executeSQLQuery(query);
    return result.rows[0];
};