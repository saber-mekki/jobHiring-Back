import express from "express";
import {
  addBookingController,
  deleteBookingController,
  getBookingController,
  updateBookingController
} from "../../controllers/bookings";

const router1 = express.Router();

/**
 * @swagger
 * /booking:
 *   get:
 *     summary: Get a list of bookings days
 *     tags: [Bookings]
 *     parameters:
 *        - in: query
 *          name: bookingId
 *          required: false
 *          schema:
 *            type: string
 *     responses:
 *       200:
 *         description: ok
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 *       500:
 *         description: error
 *         content:
 *           application/json:
 *             schema:
 *                type: object
 */
router1.route("/booking").get(getBookingController);

/**
 * @swagger
 * /addBooking:
 *  post:
 *     summary: Add a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       description: Booking details
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              firstName:
 *                 type: string
 *                 example: "Nour"
 *                 required: true
 *              lastName:
 *                 type: string
 *                 example: "Montacer"
 *                 required: true
 *              nationality:
 *                 type: string
 *                 example: "Tunisien"
 *                 required: true
 *              jobType:
 *                 type: string
 *                 example: "full time"
 *                 required: true
 *              phone:
 *                 type: number
 *                 example: "12565"
 *                 required: true
 *              seekedSalary:
 *                 type: number
 *                 example: "12345"
 *                 required: true
 *              email:
 *                 type: string
 *                 example: "nour@gmail.com"
 *                 required: true
 *              description:
 *                 type: string
 *                 example: "zzz"
 *                 required: true
 *              bookingDate:
 *                 type: string
 *                 example: "2024-07-24"
 *                 required: false
 *     responses:
 *       200:
 *         description: Booking added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking added successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router1.route("/addBooking").post(addBookingController);

/**
 * @swagger
 * /deleteBooking:
 *   delete:
 *     summary: Delete a booking by id
 *     tags: [Bookings]
 *     parameters:
 *       - in: query
 *         name: bookingId
 *         schema:
 *           type: string
 *         required: true
 *         description: The booking to be deleted
 *     responses:
 *       200:
 *         description: Booking deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking deleted successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router1.route("/deleteBooking").delete(deleteBookingController);

/**
 * @swagger
 * /updateBooking:
 *   put:
 *     summary: Update a booking
 *     tags: [Bookings]
 *     requestBody:
 *       description: Booking details to update
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *              bookingId:
 *                 type: string
 *                 example: "123"
 *                 required: true
 *              firstName:
 *                 type: string
 *                 example: "NewFirstName"
 *                 required: false
 *              lastName:
 *                 type: string
 *                 example: "NewLastName"
 *                 required: false
 *              nationality:
 *                 type: string
 *                 example: "NewNationality"
 *                 required: false
 *              jobType:
 *                 type: string
 *                 example: "NewJobType"
 *                 required: false
 *              phone:
 *                 type: number
 *                 example: 1234567890
 *                 required: false
 *              seekedSalary:
 *                 type: number
 *                 example: 50000
 *                 required: false
 *              email:
 *                 type: string
 *                 example: "newemail@example.com"
 *                 required: false
 *              description:
 *                 type: string
 *                 example: "New description"
 *                 required: false
 *              bookingDate:
 *                 type: string
 *                 example: "2024-08-01"
 *                 required: false
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Booking updated successfully"
 *       404:
 *         description: Not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Booking not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router1.route("/updateBooking").put(updateBookingController);

export default router1;
