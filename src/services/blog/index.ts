import { executeSQLQuery } from "../../database";

export const getBlog = async (blogId?: number) => {
    let query;
    let params: any[] = [];
    
    if (!blogId) {
        query = 'SELECT * FROM public."blogTable";';
    } else {
        query = 'SELECT * FROM public."blogTable" WHERE "blogId" = $1;';
        params = [blogId];
    }
    
    const result = await executeSQLQuery(query, params);
    return result.rows;
};

export const addBlog = async (
    blogAuthor: string,
    blogTitle: string,
    blogDate: string,
    blogContent: string,
    authorId: number,
    blogImage: string | null
) => {
    const query = `
        INSERT INTO public."blogTable"(
            "blogAuthor", "blogTitle", "blogDate", "blogContent", "blogImage", "authorId"
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
    `;
    
    const params = [blogAuthor, blogTitle, blogDate, blogContent, blogImage, authorId];
    const result = await executeSQLQuery(query, params);
    return result.rows[0];
};

export const deleteBlog = async (blogId: number) => {
    const query = 'DELETE FROM public."blogTable" WHERE "blogId" = $1 RETURNING "blogId"';
    const params = [blogId];
    
    const result = await executeSQLQuery(query, params);
    return result.rows[0];
};

export const updateBlog = async (
    blogId: number,
    blogAuthor: string,
    blogTitle: string,
    blogDate: string,
    blogContent: string,
    blogImage: string | null
) => {
    const query = `
        UPDATE public."blogTable"
        SET "blogAuthor" = $1, 
            "blogTitle" = $2, 
            "blogDate" = $3,
            "blogContent" = $4, 
            "blogImage" = $5
        WHERE "blogId" = $6
        RETURNING *
    `;
    
    const params = [blogAuthor, blogTitle, blogDate, blogContent, blogImage, blogId];
    const result = await executeSQLQuery(query, params);
    return result.rows[0];
};