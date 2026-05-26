import { auth } from '@/adminAuth';
import ManageAccountComponent from '@/components/Shop/ManageAccount';
import { db } from '@/database/drizzle';
import { adminTable } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

const ManageAccount = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/admin/sign-in")
    }

    const [admin] = await db
        .select()
        .from(adminTable)
        .where(eq(adminTable.id, session.user.id))
        .limit(1);
    return (
        <div>
            <ManageAccountComponent user={admin}/>
        </div>
    )
}

export default ManageAccount