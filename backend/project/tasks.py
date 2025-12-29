from celery import shared_task
from django.core.exceptions import ObjectDoesNotExist
from .models import ProjectAsset
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def process_project_asset(self, asset_id):
    """
    Celery task to process a ProjectAsset.
    Future hooks:
      - generate preview
      - checksum verification
      - move to cloud if client_review=True
    """
    try:
        asset = ProjectAsset.objects.get(id=asset_id)

        # Example: Future processing hooks
        # generate_preview(asset)
        # verify_checksum(asset)
        # if asset.client_review:
        #     move_to_cloud(asset)

        # Mark as processed
        asset.processed = True
        asset.save()

        logger.info(f"ProjectAsset {asset_id} processed successfully.")

    except ObjectDoesNotExist:
        logger.error(f"ProjectAsset with id {asset_id} does not exist.")
    except Exception as exc:
        logger.error(f"Error processing ProjectAsset {asset_id}: {exc}")
        # Retry the task in case of temporary failure
        raise self.retry(exc=exc)
