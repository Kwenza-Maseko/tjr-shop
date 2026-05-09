import { auth } from "@/adminAuth"
import { db } from "@/database/drizzle"
import { adminTable } from "@/database/schema"
import { eq } from "drizzle-orm"

export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return Response.json({ success: false, message: "Unauthorized" }, { status: 401 })
        }

        // Check that the requesting admin exists and has been granted access
        const [requestingAdmin] = await db
            .select()
            .from(adminTable)
            .where(eq(adminTable.id, session.user.id))
            .limit(1)

        if (!requestingAdmin) {
            return Response.json({ success: false, message: "Admin not found" }, { status: 404 })
        }

        if (requestingAdmin.accessGranted !== "GRANTED") {
            return Response.json({ success: false, message: "Access denied" }, { status: 403 })
        }

        // Now fetch all granted admins
        const data = await db
            .select()
            .from(adminTable)
            .where(eq(adminTable.accessGranted, "GRANTED"))

        return Response.json({ success: true, data })

    } catch (error) {
        console.error(error)
        return Response.json({ success: false }, { status: 500 })
    }
}