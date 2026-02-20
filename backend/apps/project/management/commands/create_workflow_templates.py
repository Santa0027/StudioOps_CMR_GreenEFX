from django.core.management.base import BaseCommand
from apps.project.models import ProjectStageTemplate, ProjectStageElementTemplate

class Command(BaseCommand):
    help = 'Creates predefined workflow templates'

    def handle(self, *args, **options):
        self.stdout.write('Creating workflow templates...')

        templates = {
            'Pre-production': [
                'Scripting',
                'Storyboard',
                'Character Design',
                'Environment Design',
            ],
            'Rough Cut': [
                'Animatic',
                'Rough Animation',
                'Initial Sound',
            ],
            'Coloring': [
                'Background Coloring',
                'Character Coloring',
                'Effects Coloring',
            ],
            'Post-production': [
                'Final Compositing',
                'Sound Design',
                'Final Render',
            ],
            'VFX Pipeline': [
                'Tracking',
                'Rotoscoping',
                'Compositing',
                'Color Grading',
                'Final Output',
            ]
        }

        for template_name, elements in templates.items():
            stage_template, created = ProjectStageTemplate.objects.get_or_create(
                name=template_name,
                defaults={'description': f'A standard workflow for {template_name}.'}
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f'Successfully created project stage template: "{template_name}"'))
            else:
                self.stdout.write(self.style.WARNING(f'Project stage template "{template_name}" already exists.'))
                # Clear existing elements to ensure a clean slate
                stage_template.task_templates.all().delete()
                self.stdout.write(self.style.WARNING(f'Cleared existing elements for "{template_name}" to recreate them.'))


            for element_name in elements:
                ProjectStageElementTemplate.objects.create(
                    stage=stage_template,
                    name=element_name,
                    description=f'Task for {element_name}',
                    default_estimated_hours=8 # a default value
                )
                self.stdout.write(self.style.SUCCESS(f'  - Created element: "{element_name}" for template "{template_name}"'))

        self.stdout.write(self.style.SUCCESS('All workflow templates have been created or updated.'))
