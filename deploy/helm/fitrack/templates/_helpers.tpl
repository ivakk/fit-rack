{{/*
FiTrack Helm helpers
*/}}
{{- define "fitrack.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{- define "fitrack.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{- define "fitrack.labels" -}}
app.kubernetes.io/name: {{ include "fitrack.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ include "fitrack.name" . }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}

{{- define "fitrack.selectorLabels" -}}
app.kubernetes.io/name: {{ include "fitrack.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "fitrack.image" -}}
{{- $img := index .Values.images .component -}}
{{- printf "%s:%s" $img.repository $img.tag -}}
{{- end }}
