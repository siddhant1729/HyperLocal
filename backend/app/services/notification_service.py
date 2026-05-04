from sqlalchemy.ext.asyncio import AsyncSession
from ..models.notification import Notification


async def create_notification(
    db: AsyncSession,
    user_id: str,
    title: str,
    message: str,
    notif_type: str = "info",
):
    """Persist an in-app notification for polling by the frontend."""
    notif = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=notif_type,
    )
    db.add(notif)
    await db.commit()
    await db.refresh(notif)
    return notif
