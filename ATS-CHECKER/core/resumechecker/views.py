from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.throttling import ScopedRateThrottle
from .analyzer import process_resume
from .models import JobDescription, Resume
from .serializer import JobDescriptionSerializer, ResumeSerializer

class JobDescriptionAPI(APIView):
    def get(self, request):
        queryset = JobDescription.objects.all()
        serializer = JobDescriptionSerializer(queryset, many=True)

        return Response({
            'status': True,
            'data': serializer.data
        })

    def post(self, request):
        serializer = JobDescriptionSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': False,
                'message': 'errors',
                'data': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()
        return Response({
            'status': True,
            'message': 'job description created',
            'data': serializer.data
        }, status=status.HTTP_201_CREATED)


class AnalyzeResumeAPI(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'resume_analysis'

    def post(self, request):
        jd_id = request.data.get('job_description')
        if not jd_id:
            return Response({
                'status': False,
                'message': 'job_description is required',
                'data': {}
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            jd = JobDescription.objects.get(id=jd_id)
        except (JobDescription.DoesNotExist, ValueError, TypeError):
            return Response({
                'status': False,
                'message': 'invalid job_description id',
                'data': {}
            }, status=status.HTTP_404_NOT_FOUND)

        serializer = ResumeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({
                'status': False,
                'message': 'errors',
                'data': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)

        resume_instance = serializer.save()   # save() returns the instance

        result = process_resume(resume_instance.resume.path, jd.job_description)
        if result is None:
            return Response({
                'status': False,
                'message': 'resume analysis failed — check server logs',
                'data': {}
            }, status=status.HTTP_502_BAD_GATEWAY)

        return Response({
            'status': True,
            'message': 'resume analyzed',
            'data': result
        })