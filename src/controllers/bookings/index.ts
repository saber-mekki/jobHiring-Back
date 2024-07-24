import { addBooking, deleteBooking, getBooking, updateBooking } from "../../services/bookings";
import { Request, Response } from "express";

export const getBookingController = async (req: Request, res: Response) => {
  const { bookingId } = req.body;

  try {
    const result = await getBooking(bookingId);
    res.status(200).json({ data: result });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};

export const addBookingController = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    nationality,
    jobType,
    phone,
    seekedSalary,
    email,
    description,
    bookingDate
  } = req.body;

  try {
    const newBooking = await addBooking(
      firstName as string,
      lastName as string,
      nationality as string,
      jobType as string,
      phone as number,
      seekedSalary as number,
      email as string,
      description as string,
      new Date(bookingDate) // Ensure bookingDate is a valid Date object
    );

    res.status(200).json({ data: newBooking });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};

export const deleteBookingController = async (req: Request, res: Response) => {
  const { bookingId } = req.query;

  try {
    const deletedBooking = await deleteBooking(bookingId as string);
    res.status(200).json({ data: deletedBooking });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};

export const updateBookingController = async (req: Request, res: Response) => {
  const { bookingId } = req.body;
  const updateFields = req.body;

  try {
    const updatedBooking = await updateBooking(bookingId, updateFields);
    res.status(200).json({ data: updatedBooking });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error });
  }
};
