import shutil
import tempfile
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings

from .analyzer import normalize_result
from .models import JobDescription

TEMP_MEDIA = tempfile.mkdtemp()


@override_settings(MEDIA_ROOT=TEMP_MEDIA)
class AnalyzeResumeAPITests(TestCase):
    @classmethod
    def tearDownClass(cls):
        shutil.rmtree(TEMP_MEDIA, ignore_errors=True)
        super().tearDownClass()

    def setUp(self):
        self.jd = JobDescription.objects.create(
            job_title="Python Developer", job_description="Python, Django"
        )

    def pdf(self, name="cv.pdf", content=b"%PDF-1.4 test"):
        return SimpleUploadedFile(name, content, content_type="application/pdf")

    def test_missing_job_description(self):
        res = self.client.post("/api/resume/", {"resume": self.pdf()})
        self.assertEqual(res.status_code, 400)

    def test_invalid_job_description(self):
        res = self.client.post("/api/resume/", {"job_description": 999, "resume": self.pdf()})
        self.assertEqual(res.status_code, 404)

    def test_rejects_non_pdf(self):
        res = self.client.post(
            "/api/resume/",
            {"job_description": self.jd.id, "resume": self.pdf("cv.exe")},
        )
        self.assertEqual(res.status_code, 400)

    @override_settings(MAX_RESUME_SIZE=10)
    def test_rejects_large_file(self):
        res = self.client.post(
            "/api/resume/",
            {"job_description": self.jd.id, "resume": self.pdf(content=b"x" * 20)},
        )
        self.assertEqual(res.status_code, 400)

    @patch("resumechecker.views.process_resume", return_value={"match_percentage": 80})
    def test_success(self, mock_process):
        res = self.client.post(
            "/api/resume/", {"job_description": self.jd.id, "resume": self.pdf()}
        )
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["data"]["match_percentage"], 80)
        mock_process.assert_called_once()

    @patch("resumechecker.views.process_resume", return_value=None)
    def test_analysis_failure(self, _):
        res = self.client.post(
            "/api/resume/", {"job_description": self.jd.id, "resume": self.pdf()}
        )
        self.assertEqual(res.status_code, 502)


class JobDescriptionAPITests(TestCase):
    def test_create_and_list(self):
        res = self.client.post(
            "/api/jobs/", {"job_title": "Dev", "job_description": "Python"}
        )
        self.assertEqual(res.status_code, 201)
        res = self.client.get("/api/jobs/")
        self.assertEqual(len(res.json()["data"]), 1)


class NormalizeResultTests(TestCase):
    def test_coerces_types(self):
        result = normalize_result({"skills": "Python", "match_percentage": "85%"})
        self.assertEqual(result["skills"], ["Python"])
        self.assertEqual(result["match_percentage"], 85.0)
        self.assertEqual(result["missing_skills"], [])

    def test_clamps_percentage(self):
        self.assertEqual(normalize_result({"match_percentage": 150})["match_percentage"], 100.0)
        self.assertEqual(normalize_result({"match_percentage": "n/a"})["match_percentage"], 0.0)
