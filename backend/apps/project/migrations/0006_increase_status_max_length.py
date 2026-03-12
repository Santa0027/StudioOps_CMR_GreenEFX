from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('project', '0005_projectstageelement_status_notes_taskstatuslog_notes'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectstageelement',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pending'),
                    ('in_progress', 'In Progress'),
                    ('waiting_review', 'Waiting for Review'),
                    ('waiting_client_review', 'Waiting for Client Review'),
                    ('blocked', 'Blocked'),
                    ('completed', 'Completed'),
                    ('rejected', 'Rejected'),
                    ('on_hold', 'On Hold'),
                ],
                default='pending',
                max_length=30,
            ),
        ),
        migrations.AlterField(
            model_name='projectstageelement',
            name='previous_status',
            field=models.CharField(
                blank=True,
                choices=[
                    ('pending', 'Pending'),
                    ('in_progress', 'In Progress'),
                    ('waiting_review', 'Waiting for Review'),
                    ('blocked', 'Blocked'),
                    ('completed', 'Completed'),
                    ('rejected', 'Rejected'),
                    ('on_hold', 'On Hold'),
                ],
                max_length=30,
                null=True,
            ),
        ),
        migrations.AlterField(
            model_name='taskstatuslog',
            name='old_status',
            field=models.CharField(max_length=30),
        ),
        migrations.AlterField(
            model_name='taskstatuslog',
            name='new_status',
            field=models.CharField(max_length=30),
        ),
    ]
