import { auth } from '@/adminAuth';
import ManageUserAccountComponent from '@/components/ManageUserAccountComponent';
import { db } from '@/database/drizzle';
import { userTable } from '@/database/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

const ManageAccount = async () => {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/sign-in")
    }

    const [user] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, session.user.id))
        .limit(1);
    return (
        <div>
            <ManageUserAccountComponent user={user}/>
        </div>
    )
}

export default ManageAccount